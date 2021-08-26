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