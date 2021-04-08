延迟渲染中，动态的在shader中使用id来选择着色方式会引起效率低下，尤其是着色方式很多的情况下  
# 具体原因
猜测是，按照warp来进行计算的gpu在同一个warp中存在多个分支时，效率就会下降。相对的，如果if语句的结果在warp中是相同的，影响会减小  
不过具体又是如何？如何根据硬件评估这个性能损失  
# 解决方案-顽皮狗-ID缓冲
[ppt](http://advances.realtimerendering.com/s2016/s16_ramy_final.pptx)   
* 将材质的id(`bitmask`)渲染到RT，然后用CS解析  
* CS按照`16x16`的tile来dispatch，进行reduce来获得线程组内的最简单shader的id(`shaderID`)。比如tile内存在三种着色模型，得出的结果就是一个包含了三种着色器模型的shader  
* 对每一种`shader`(light阶段的shader)，维护一个offset，表述当前有多少个tile应用此shader
* 用原子操作增加这个offset，并将结果作为id，存入另一个buffer  
    ```cpp
    tileBuffers[shaderID][offset] = groupID
    ```
## 优化
对整个tile都是一种shader的情况进行优化，在这种情况下，应该使用`branchless`的shader。  
这里不懂，branless的shader和有分支的shader在GPU固然不同，但在上述逻辑上，应该是一样的才对。然而却有特殊处理，在代码中有分支和无分支的shader被分成两个查找表  
