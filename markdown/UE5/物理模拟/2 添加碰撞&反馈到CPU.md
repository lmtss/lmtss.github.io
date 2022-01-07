上周把插件迁到UE5了，所以现在变成了UE5上的物理模拟    

这次给布料添加碰撞，为了简化模型，我们只让布料和一个球体进行碰撞。因为已知是球体，所以我们就能用简单的解析式来表示，就像`SDF`一样。  

我们先来做一个离散的碰撞检测，看一下PBD是怎么说的     
>We compute the surface point $q_s$ which is closest to $p_i$ and the surface normal $n_s$ at this position. An inequality constraint with constraint function $C(p) = (p − q_s) \cdot n_s$ andstiffness $k$ = 1 is added to the list of constraints.

在当前的情况下，可以描述成: 如果一个布料的顶点进入了球体中，那么视为发生碰撞，计算距离顶点位置$p_i$最近的球体表面位置$q_s$，然后添加一个不等式约束$C(p) = (p − q_s) \cdot n_s$。


<div align=center><img src="../../../img/Physics/Collision-0.png"><div>左侧指发生碰撞，布料的顶点进入球体内部；右侧指经过校正，布料顶点移出球体，此时夹角CosTheta大于0(不等式中点乘的结果)，满足不等式约束</div></div>  

球体模型十分简单，我们可以用 $Distance < Radius$来判断是否在球体内部，而位置 $q_s$和法线也很好得出。  
所以在我们的这个简化模型中，这个约束在存储时可以简单地记录一个三维向量 $\vec{q_s}-\vec{p_i}+\vec{n_s}*coeff$，然后在计算的时候加上这个向量就好。  

# 实现
新增一个参数，传递球体信息
```cpp
//xyz: 球体坐标 z: 半径
float4 SphereCollisionParam;
```  

```cpp
float SphereRadius = SphereCollisionParams.w;
float3 SphereCenter = SphereCollisionParams.xyz;
float3 CenterToPosition = Position - SphereCenter;
float DistSqr = dot(CenterToPosition, CenterToPosition);

//球体内
if (DistSqr < SphereRadius * SphereRadius)
{
    float3 Normal = CenterToPosition * rsqrt(DistSqr);
    float3 Offset = SphereCenter + Normal * SphereRadius - Position;

    //碰撞约束是一定要满足的约束，因此不和其他约束取平均，也就是说不累加
    Acc = Offset;
    ProjN = 1.0;
}
```

<div align=center><img src="../../../img/Physics/Simple-MS-EXP-5.gif"><div>撞到小球后发生形变</div></div>  

# 如何反馈到小球？
当前的小球只是一个static mesh component，是不在这个GPU模拟系统里面的，算是一个外物。因此要想给小球反馈，需要将碰撞信息写入buffer，通过GPU传递到CPU。   
一个问题是，GPU和CPU之间传输buffer并不快速，因此应该减少传输的数据量。我们在计算碰撞时，每一个线程代表一个布料顶点，如果小球足够的大，那么可能和多个顶点发生碰撞，也有很多线程不发生碰撞，不发生碰撞的线程不应该写入buffer，因此写入到buffer的位置就不能是单纯的线程ID。  
比如线程 0~8中只有 1 3 5 发生了碰撞，那么他们应该写入到 0 1 2位置上，这个事情在cpu串行计算时很好实现，但在gpu并行时就有了线程间同步问题。  
在GPU编程中，这是个归约(Reduction)操作，网上有很多介绍的文章可以参考。我之前也写了两个关于UE引擎中的归约算法的文章。  
[UE4阅读笔记-Niagara&Warp指令](https://zhuanlan.zhihu.com/p/450586745)   
[UE引擎中的归约算法](https://zhuanlan.zhihu.com/p/452965458)  

## ComputeShader
选择实现一个`Inclusive scan`，除此之外基本上和[UE引擎中的归约算法](https://zhuanlan.zhihu.com/p/452965458)中提到的UE自带的归约算法一致。    
同样使用一个buffer存储输出，一个buffer用来同步线程组级别的写入位置  
```cpp
RWBuffer<half4> FeedbackBuffer;         //输出
RWBuffer<uint> FeedbackBufferSizes;     //用来在线程组间同步写入位置
```
同样用shared memory在线程间同步  
```cpp
groupshared uint GroupWriteOffsets[2 * THREAD_COUNT];
groupshared uint GroupWriteStart;
```  
不同的是，使用`Inclusive scan`，不做偏移
```cpp
//球体内
if (DistSqr < SphereRadius * SphereRadius) {
    //...
    bIsCollis = 1;
}
GroupWriteOffsets[Thread] = bIsCollis;
```
中间部分和UE中的一致，最后不同，我们写入的是当前顶点反馈到球体的向量，并且写入的offset要减去自己，因为一个线程只占一个位置，所以减去 1。
```cpp
if (bIsCollis) 
{
    uint WriteOffset = GroupWriteStart + GroupWriteOffsets[OutBuffer * THREAD_COUNT + Thread] - 1;
    FeedbackBuffer[WriteOffset] = Feedback;
}
```
## GPU to CPU
当前的buffer是`FRWBuffer`，在UE4中，`FRWBuffer`是由`FVertexBufferRHIRef`和其SRV、UAV构成，而现在是`FBufferRHIRef`   
```cpp
UE_DEPRECATED(5.0, "FIndexBufferRHIRef is deprecated, please use FBufferRHIRef.")      typedef FBufferRHIRef FIndexBufferRHIRef;
UE_DEPRECATED(5.0, "FVertexBufferRHIRef is deprecated, please use FBufferRHIRef.")     typedef FBufferRHIRef FVertexBufferRHIRef;
UE_DEPRECATED(5.0, "FStructuredBufferRHIRef is deprecated, please use FBufferRHIRef.") typedef FBufferRHIRef FStructuredBufferRHIRef;
```  
CPU读取buffer，UE4中要用RHILockVertexBuffer，UE5用`RHILockBuffer`。  
样例代码  
```cpp
//此处的 1是因为只有1个feedbackbuffer需要记录长度
void* SizeData = RHILockBuffer(VertexFactory.FeedbackBufferSizes.Buffer, 0, 1 * sizeof(uint32), RLM_ReadOnly);

uint32* SizeBufferData = static_cast<uint32*>(SizeData);

//反馈向量的数量
uint32 NumFeedback = SizeBufferData[0];

//...

RHIUnlockBuffer(VertexFactory.FeedbackBufferSizes.Buffer);
```  
这样就在CPU端得到了对小球的反馈，接下来添加位移就好，cpu端控制小球的代码就不写了。

<div align=center><img src="../../../img/Physics/Simple-MS-EXP-6.gif"><div>根据法线方向直接改变小球位置</div></div>  


## 分步


# 重构代码
当前的距离约束、碰撞约束、碰撞检测、碰撞反馈邪恶地挤到了一个计算着色器中，但功能变得复杂(变得正常)时，放在一个着色器肯定是不行的，