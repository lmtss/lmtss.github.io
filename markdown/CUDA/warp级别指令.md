NVIDIA gpu 的warp是指执行同一指令的thread组，即SIMT，单指令、多线程  
## 参考
[NVIDIA Using CUDA Warp-Level Primitives](https://devblogs.nvidia.com/using-cuda-warp-level-primitives/)  


## shuffle指令
warp内thread间获取变量值，比share memory更快  
`cuda9.0`之后弃用了`__shfl`，`__shfl_up` 等，改为下面的  
```cpp
T __shfl_sync(
    unsigned mask,      //emmmm 无脑设0xFFFFFFFF
    T var, 
    int srcLane,        //源线程id
    int width=warpSize
    );

T __shfl_up_sync(
    unsigned mask, T var, unsigned int delta, int width=warpSize
    );

T __shfl_down_sync(
    unsigned mask, T var, unsigned int delta, int width=warpSize
    );

T __shfl_xor_sync(
    unsigned mask, T var, int laneMask, int width=warpSize
    );
```
参数 `mask` 
![](/img/CUDA_shfl_down.webp "shfl_down")
图源来自[NVIDIA](https://devblogs.nvidia.com/using-cuda-warp-level-primitives/)  ，看了这张图应该就明白为什么叫`__shfl_down`了吧  