使用srp写shadowmap的时候，有一些麻烦的地方。
## 格式 RenderTextureFormat.Shadowmap
`RenderTextureFormat.Shadowmap` 被推荐作为shadowmap的纹理格式，但这玩意存储格式是啥，就很难懂。  
若直接使用 `Tex2D(shadowmap, xy).r` 的方式读取，是有问题的。  
查资料可以找到 `CommandBuffer.SetShadowSamplingMode()` 这个方法，可以设定 `ShadowSamplingMode.CompareDepths`或`ShadowSamplingMode.RawDepth`，CompareDepths是默认方式，而RawDepth就是通常思路上的方式(读取纹理的r，然后比较z)

## 记一个自己的沙雕事
我试图用compute shader对纹理进行处理，但是直接用ComputeShader.Dispatch，没有用CommandBuffer来做，结果就是执行顺序不正确。  
我竟然找了半天bug。