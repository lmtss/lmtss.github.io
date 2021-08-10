# 一些思路
受益  
* DOF-tonemap，DOF的最后一步输出到PLS，随后紧接着tonemap
* distort，第一步收集过程输出到PLS中
* 全屏的后处理材质，如果只采样一次scenecolor，且在tonemap之前
* scenecapture的半透明，只绘制一次，将半透明度绘制在PLS中，在Tonemap之前加一个subpass来将这个半透明输出到RT的a  
但是需要shader的变体
也可以绘制两次，但是在一个RenderPass中，这样也有一定的意义。不过还是要shader变体，毕竟要防止不支持PLS的机型  
所以绘制object的shader暂时不搞PLS比较好  
另外，PLS应该是不支持blend，但是blend自己做就好
* 对于海底扭曲效果，融合到distort中，或许

问题  

* 是否能够不绑定texture在framebuffer的情况下draw？这样能不破坏UE4的图结构    
* 或者保持UE4图结构上层写法基本不变，通过小的修改，让一个图节点的绘制后，不结束renderpass  
  
需要修改combineLUTS步骤，让其提前绘制，或者不绘制  
# 用法
[arm的样例](https://github.com/ARM-software/opengl-es-sdk-for-android/tree/master/samples/advanced_samples)  
[arm样例-半透明](https://github.com/ARM-software/opengl-es-sdk-for-android/tree/master/samples/advanced_samples/Translucency)  
## 机型支持资料
## ue4相关
### 检查机型支持
`framebufferfetch`在UE4中是有一个全局的变量`GSupportsShaderFramebufferFetch`来描述是否支持的，PLS也写一个相似的即可  
ue5已经有相应的代码(`GSupportsPixelLocalStorage`)了，只不过我用的版本没有  
声明于`Engine/Source/Runtime/RHI/Public/RHI.h`  
赋值于`Engine/Source/Runtime/OpenGLDrv/Private/OpenGLDevice.cpp`  
在`Engine/Source/Runtime/OpenGLDrv/Private/OpenGLES.cpp`从扩展字符串中获取  
### shader编译
使用`framebufferfetch`拓展时，ue4会在跨平台编译shader的代码中处理相关内容  
毕竟usf是hlsl  
在UE5中也有[相关代码](https://github.com/EpicGames/UnrealEngine/blob/5.0.0-early-access-2/Engine/Source/Developer/ShaderFormatOpenGL/Private/GlslBackend.cpp)，但看起来只是给延迟渲染用的  
glsl应该是在HLSLCC里面做的处理，而metal而不是  
[交叉编译相关文档](https://docs.unrealengine.com/4.26/zh-CN/ProgrammingAndScripting/Rendering/ShaderDevelopment/HLSLCrossCompiler/)  
使用`make_intrinsic_genType`函数添加`PLS`操作为内置函数  
参考`FrameBufferFetch`相关代码  
```cpp
//添加内置指令
make_intrinsic_genType(ir, State, FRAMEBUFFER_FETCH_ES2, ir_invalid_opcode, IR_INTRINSIC_FLOAT, 0, 4, 4);
//...
//判断是否使用了FrameBufferFetch
const bool bUsesFrameBufferFetch = Frequency == HSF_PixelShader && UsesUEIntrinsic(ir, FRAMEBUFFER_FETCH_ES2);
```  
不过UE5(5.0.0-early-access-2)的代码中，并未用make_intrinsic_genType处理PLS和MRTFetch，而是实现了一个函数`AddIntrisicVecParam`  
亲测在使用make_intrinsic_genType处理读取操作时表现正常，而处理写入操作的时候，写入操作会消失，可能是优化掉了？  
### 运行时的cpp部分 
时间长了，opengl怎么用也有点忘了  
使用这个拓展需要
`glEnable(GL_SHADER_PIXEL_LOCAL_STORAGE_EXT);`  
代码在`Engine/Source/Runtime/OpenGLDrv/Private/OpenGLRenderTarget.cpp`  
## 测试
华为mate20，测试Distort步骤，用性能狗测试带宽，并没有丝毫的带宽减少，md  
可能性

* Distort本来符合某些硬件上的机制，比如cache
  * 修改了Merge步骤的uv，改为(1-uv)，带宽仍未变化，不像时cache的问题，不是tile based引起
* 性能狗的问题
  * 将Distort的第一个Pass的RT的尺寸改为一半，发现仍未有带宽数值变化，这或许说明和tile memory无关了
  * 将第一个Pass的RT的format从rgba8改为RGBA16F，带宽增加
    * 或许有针对32bit缓冲区的优化？
  * 换成arm的streamline之后，也没有显示memory相关的变动
* PLS的实现，手机厂商的问题

结果是因为`Transaction Elimination`，我的测试demo中摄像机不动，特效也不随着时间变化，也就没了写回内存的消耗  
耗时上  
用RenderDoc显示使用了PLS后耗时增加，md