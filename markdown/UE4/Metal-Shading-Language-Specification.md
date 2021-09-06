# 4.4 线程组地址空间
线程组中的线程
通过`线程组内存`分享数据
并在组内同步指令的执行
以便协调对线程组内存和设备内存的访问。一个给定的线程组的线程在GPU上的单个计算单元中同步地执行。一个GPU有多个计算单元。多个线程组可以跨多个计算单元并发执行。  
线程组地址空间名称用于分配核函数使用的变量或作为参数传递给片段函数(在iOS上的片元函数，线程组空间的参数需要A11及以上的硬件来支持)。声明在线程组地址空间的变量不能用在顶点函数上，并且不能再片元函数内声明。  
核函数中，线程组空间的变量被线程组上的所有线程共享，生命周期仅存在于这个核函数的执行中  
mid-render的核函数中，线程组空间的变量在图块中是持久的  
下面的样例展示了如何分配线程组空间的变量，核函数中，线程组空间的变量既能作为参数声明也能在函数内部声明。  
```cpp
kernel void
my_kernel(threadgroup float *a [[threadgroup(0)]],
…)
{
// A float allocated in the threadgroup address space
threadgroup float x;
// An array of 10 floats allocated in the
// threadgroup address space
threadgroup float b[10];
}

```  
# 4.5 threadgroup_imageblock地址空间
`这节有些地方还不确定含义`  
* 分配在核函数中的`threadgroup_imageblock`地址空间的变量被线程组中所有线程共享，其生命周期仅存在于此核函数的执行中(`此处的变量是指参数形式的还是指声明在函数内的？`)。每个线程组内的线程使用显式的2D坐标来访问imageblocks。不要假设线程和图像块之间有任何特定的空间关系。线程组的尺寸会比tile小