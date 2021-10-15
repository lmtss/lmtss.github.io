顶点buffer用的不多，记一下  
`RCHICreateVertexBuffer`  
更新：  
```cpp
//flag 是EResourceLockMode,只写、只读
void* Data = RHILockVertexBuffer(VertexBufferRHI, 0, size, flag);
FVector* BufferData = static_cast<FVector*>(Data);
//....给BufferData赋值
RHIUnLockVertexBuffer(VertexBufferRHI)
```  
使用：
```cpp
RHICmdList.SetStreamSource(0, VertexBufferRHI, 0);
RHICmdList.Drawxxx(...);
```  
选择`VertexDecl`的时候，注意一下shader中stream输入的layout，缺少的话会报错

# IndexBuffer 
## 1
参考`HairStrands`
在`UGroomComponent`初始化资源的时候，就会对VF的各种buffer进行计算  
从`HairStrandsVertexFactory.ush`可以看出，vertex shader获取顶点信息是通过vertexID显式地在shader中读取buffer的值，而不是常规的IA  
`IndexBuffer`是nullptr，shit
## 2
看到了一个`OctreeDynamicMeshSceneProxy`  
其中命名了一个‘动态indexbuffer’，不过看起来是cpu赋值
## 3
`https://social.msdn.microsoft.com/Forums/sqlserver/en-US/8c75119d-bcce-4400-bade-1c2f751dcb54/using-uav-data-from-compute-shader-as-vertex-data?forum=wpdevelop`  
看起来从图形api上应该可以  
## emmm
使用了indexbuffer的情况下，`VertexID`指的是什么？  
是indexbuffer的ID，还是vertexbuffer的ID？  
IndexBuffer的值的排布是否影响效率？  