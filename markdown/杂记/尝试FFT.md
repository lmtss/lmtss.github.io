## 记录一些性能测试
使用RenderDoc  
红米note7  
Adreno 512  
Snapdragon 660  
WorkGroup为[1,128,1]  
两次dispatch计算一次IFFT，耗时约2.2ms，其中一次约1.1ms  
去掉其中计算和sm读写同步的代码，只留下读写纹理的消耗，一次耗时为0.6ms。  
这样来考虑，如果改为更多次数的dispatch和更少的线程数量来减少线程同步相关消耗也是不值得的  
### cos sin
shader中使用了10次cos和sin操作，是否导致一定的性能问题？  
发现计算上消耗并不高，主要在share memory上，或者说Cache上面？mali文档中写道mali中并没有真正的share memory  
高通的如何？
### Texture vs TexelFetch
ue4会将hlsl中的`texture.Load`翻译为`TexelFetch`  
[arm网站上一篇文章](https://developer.arm.com/documentation/101897/0200/compute/image-processing)  
```
Use texture() instead of imageLoad() for reading read-only texture data. texture() works with Arm Frame Buffer Compression (AFBC) textures that have been rendered by previous fragment passes. Using texture() also load balances the GPU pipelines better because texture() operations use the texture unit and both imageLoad() and imageStore() use the load or store unit. The load-store units are often already being used in compute shaders for generic memory accesses.
```  
```
texture()使用了纹理单元(texture unit)，而imageLoad()和imageStore()使用的是读取单元和存储单元(load or store unit)  
读取-存储单元也常用在计算着色器的通用访存(generic memory accesses)中
```  
不过`TexelFetch`看起来并不是`imageLoad`  
更换了`Texture`和`TexelFetch`，耗时变化并不明显，毕竟只读了一次纹理
### unsigned int
有些指令上用unsigned int会比int好，比如%  