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
