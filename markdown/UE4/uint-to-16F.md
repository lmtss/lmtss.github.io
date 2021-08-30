虽然不算是UE4的问题  
## 如何使用uint16编码16F的纹理？  
发现HLSL中有`f32tof16`，因此直接把uint16作为bulkdata放入纹理，在材质中用`f32to16`读出来就好  
## bulkdata中怎么存放正常的float16？
## FFloat16Color
UE4实现了Float16类型