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
对`FramebufferFetch`函数的定义是在运行时的cpp中，向shader中添加宏定义
## 4.26是否有改动?
在后处理部分，如果scenecolorformat为R11G11B10，则会使用深度纹理  
不过并非是每一步都用深度纹理，比如景深的输入是一个`R16F`纹理，这是在`Sunmask`步骤生成的
# 使用depth frame buffer fetch
考虑到性能，可以尝试用frame buffer fetch获取深度缓冲  
需要支持相应的拓展  
UE4中，相应的代码在GlslBackend中，需要`#extension GL_ARM_shader_framebuffer_fetch_depth_stencil : enable`
## MRT+Fetch
ios需要，不过要注意编译shader的bug，[SPIRV-CROSS](https://github.com/EpicGames/UnrealEngine/blob/4.24/Engine/Source/ThirdParty/ShaderConductor/ShaderConductor/External/SPIRV-Cross/spirv_msl.cpp)  
```cpp
//4.24.1
ep_args += image_type_glsl(type, var_id) + "4 " + r.name;
ep_args += " [[color(" + convert_to_string(r.index) + ")]]";
```
在4.26能够发现做出了修改[SPIRV-Cross](https://github.com/EpicGames/UnrealEngine/blame/4.26/Engine/Source/ThirdParty/ShaderConductor/ShaderConductor/External/SPIRV-Cross/spirv_msl.cpp)  
```cpp
//4.26
// UE Change Begin: [[color(N)]] use input attachment index instead of resource index for N
uint32_t input_attachment_index = get_decoration(var_id, DecorationInputAttachmentIndex); 
ep_args += " [[color(" + convert_to_string(input_attachment_index) + ")]]";
// UE Change End:
```

# 变体方案
编译多种深度相关的变体，但只有使用深度的材质才编译多余的变体  
修改`ShouldCompilePremutation`相关逻辑  
在选择shader时，如果找不到shader，会崩溃，看看能不能让他在找不到shader时，使用一个确定的编译了的shader   
然而在`GetMobileBasePassShaders`步骤的参数`Material`也无法获得正确的`是否使用了深度读取`  
经测试，此时的`Material`可以获取到`ShaderMap`，但ShaderMap返回的值错误。  
是由于使用的版本中，对应的代码错误

# MRT
使用MRT来应对SceneCapture所需要的alpha以及后处理需要的深度
## MRT的Resolve问题
首先什么是resolve

# glDiscardFramebufferEXT
## 干什么的
将某些buffer，比如depth"丢弃"，防止其resolve
## 使用
调用一次，一次两个 和 两次 一样吗
## ios
metal中设置action应该就可以了

# 单独pass
单独的translucent pass，会引起resolve吗？
# 如何测试状态切换的消耗