GPU上求前缀和算是求变长输出的一个前置技能吧，求完前缀和，就可以根据结果让输出结果找到位置  
网上资料很多，比如[GPU Gem 3](https://developer.nvidia.com/gpugems/gpugems3/part-vi-gpu-computing/chapter-39-parallel-prefix-sum-scan-cuda)，不过不写一遍还是不熟悉  
测试使用笔记本上的GTX950m  

## cuda库
### cub
### thrust
thrust提供了几个scan函数  
```cpp
thrust::exclusive_scan(thrust::device, dev_ptr, dev_ptr + size, out, 0);
```  
|长度|时间/ms|
|---|---|
|262144|27.1|
|16384|11.1|
|1024|9.8|   

感觉十分不对劲，速度有些奇怪，似乎有蜜汁初始化开销。查资料后得知，这个是CUDA的上下文开销([lazy context](https://stackoverflow.com/questions/15166799/any-particular-function-to-initialize-gpu-other-than-the-first-cudamalloc-call))，尝试去除它的影响。  
|长度|时间/ms|
|---|---|
|262144|19.9|
|16384|2.1|
|1024|1.0|  

上下表格对比，可以看出，可能存在约9ms的耗时在CUDA的上下文上。另外262144组仍花了20ms，还是........  
```cpp
thrust::inclusive_scan(thrust::device, dev_ptr, dev_ptr + size, out);
```  
|长度|时间/ms|
|---|---|
|262144|17.6|
|16384|1.95|
|1024|0.94|  

或许比上一个函数快一点，262144消耗的时间是8倍于16384，但是16384是2倍于1024.。。。。。。  
## 思路
求前缀和是一个[reduce模式](/page.html?path=CUDA/reduce模式)的问题，相关的优化可以参考的。  
不过，随着CUDA的升级，思路也多了，不再是只用share memory做优化的时候了。  
使用 `__ballot` 和 `__popc_sync` 函数可以提高效率。  
参考[stackflow](https://stackoverflow.com/questions/34059753/cuda-stream-compaction-algorithm)里面的一个[回答](https://github.com/knotman90/cuStreamComp)。测试其中一个人的代码，他代码中用了thrust，我测试用262144长度，`3.1ms`。肯定是比纯thrust快了。   
