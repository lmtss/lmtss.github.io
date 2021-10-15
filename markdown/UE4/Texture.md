## BulkData
在调用`RHICreateTexture2D`时，可以向CreateInfo中传入纹理数据
## 给材质传参数
md
## RT
UE4中创建的RenderTarget，其中的纹理创建时带有的flag看起来是不能自定义的，那如果想要让这个纹理的内容使用cpu传入的值？  
输出了一下flags，没有CPUWrite的flag  
## Copy
RHICmdList.CopyTexture  不起作用，不知为何  
ScreenPass 中的copy shader需要在RDG图结构中才能用
存在引擎自带的copytextureCS，但是我的目标是URenderTarget，是不能作为UAV的  
编写的插件不能使用postconfiginit，所以不能自定义全局shader  
！！  
`ScreenPixelShader.usf` 不用RDG的copyshader
## RT的插值
能不能在材质中采样RT的时候不用插值用点采样
### 尝试1
`RenderTarget->GetRenderTargetResource()->SamplerStateRHI = xxx`  
没有产生影响，哦，是因为材质编辑器中`sampler source`选择错了，选为`From texture asset`(应该是默认)就好  
在另一次实践中发现没有用，会变成各向异性过滤。和上次尝试不同的是，上次是后处理材质，这次是surface材质  
设置采样器的地方在  
`MeshPassProcessor.cpp`  
`RenderingCompositionGraph.cpp`  
大概因此而不同？  
当物体是新创建的东西时，采样器没有问题，如果保存到map，就有问题  
或许是因为RenderTarget创建不及时？好像不是，把RT改成静态纹理也还是各向异性过滤  
在编辑器中将`TextureGroup`改成`2D Pixels`确实可以变成`Point`采样  
`TextureRenderTarget2D.cpp`的`InitDynamicRHI`中有创建采样器的操作，直接修改这里的代码确实能够影响结果