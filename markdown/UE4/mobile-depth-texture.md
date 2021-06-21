虽然获取depth也可能和MSAA有关，但是先不谈  
通常UE4使用RGBA中的A通道来获得深度值，在shader中通常翻译为`FramebufferFetchES2().w`，不过当使用RGB纹理时，就不能用这种方式了  
理论上，直接resolve depth，让depthfade用深度纹理即可   
相关控制台指令，`r.Mobile.AlwaysResolveDepth`  
相关的性能问题需要考虑  
同时存在bug，  
# Resolve

# UE4的实现
截帧可以发现，并不是Copy了一份Depth，而是通过将depth作为texture，更换target，进行了一次绘制(这次绘制的结果无所谓，所以输出到了1x1的dummy)，来进行一种强制的resolve  
## Bug
看起来是resolve不成功，能看到破碎的效果，当不移动镜头时就没问题。不过用renderDoc截帧时，又正常resolve了。  
莫否是为了能截帧，所以确确实实的store了。  
发现在移动端上并不会运行resolve这一步骤，因为UE4想要让半透明和不透明在一个pass里面渲染来增加性能。在一个pass的情况下，也自然就没有resolve了。所以需要RequiresTranslucncy为true，来让其变成两个pass  
这个bool是通过平台来判断的(4.24)，当时AndroidOpenglES且支持FramebufferFetch时，会为false，也就是没有单独的半透明pass  
## 表现的不一致
不同机型在这里的表现不一致  
有的机型即使没有单独的半透明pass，也能有正常的表现
## ？？
在CPU上判断是否支持framebufferfetch的变量是`GSupportShaderFramebufferFetch`

在一台非mali的机器上，shader定义了，`UE_EXT_shader_framebuffer_fetch`宏  
而mali机器中，则没有  
这个宏在`OpenGLShaders.cpp`中加入shader，而是否加入则是通过判断`ExtensionString`中是否有fetch拓展(`ProcessExtensions函数`)  
编译的shader，glsl
## 4.26是否有改动?

# 使用depth frame buffer fetch
考虑到性能，可以尝试用frame buffer fetch获取深度缓冲  
需要支持相应的拓展  
UE4中，相应的代码在GlslBackend中，需要`#extension GL_ARM_shader_framebuffer_fetch_depth_stencil : enable`