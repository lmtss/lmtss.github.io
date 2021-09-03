ImageBlock一些时候可以看作PixelLocalStorage，比较不同的是Metal对于tile memory的使用更加深入，tile function等功能都能和image block扯上关系。相对的，FBF和PLS都显得局限。  
在`A11`，即`iOS GPU family 4`以上支持  
[官方OIT样例](https://developer.apple.com/sample-code/metal/Order-Independent-Transparency-with-Imageblocks.zip)   
## SPIR-V
一个问题是SPIR-V对于这样特性的支持  
像是FBF，可以写`[[vk::input_attachment_index(n)]]`来标注，而对于PLS或者ImageBlock，要怎么搞？  
或许看SPIRV-Cross相关文档比较好  
不过在SPIRV-Cross的github上面搜不到imageblock相关的东西，大概是不支持吧。PLS倒是有支持。

## UE4
显然在UE4中使用的话，难点在于交叉编译  
看起来交叉编译部分，可能是dxc或者hlslcc，两者使用方式不同，glsl是hlslcc，我们的metal是dxc。  
hlslcc算是好用，可以方便地把自己的函数注册为'内置函数'  
dxc就不清楚怎么搞了，只能自己写字符串替换？  
### UE4-ShaderConductor
虽然在`MetalDerivedData`中写字符串替换也行，但还是想看看其他方案  
ShaderConductor第三方库包含SPIRV-Cross来翻译shader
## item
```cpp
//样例代码
typedef rgba8unorm<half4> rgba8storage;
typedef r8unorm<half> r8storage;

template <int NUM_LAYERS>
struct OITData
{
    static constexpr constant short s_numLayers = NUM_LAYERS;
    
    rgba8storage colors         [[raster_order_group(0)]] [NUM_LAYERS];
    half         depths         [[raster_order_group(0)]] [NUM_LAYERS];
    r8storage    transmittances [[raster_order_group(0)]] [NUM_LAYERS];
};
//...略
//此处意味着必须要用一个(half4)转换类型？
finalColor += (half4)pixelData.colors[i]
```  
## Metal的类型
好像在这里，Metal的类型转换是一个坑  
从编译出的`.metal`文件来看，类型都是`float`，而如果把metal代码写成  
```cpp
float4 val = IMBlock.data0;
```  
其次  
```cpp
//会报错，说是不支持.xyz这样访问
IMBlock.data0.xyz
```
## error
the pipelinestate per sample imageblock usage is greater than the encoder persample  
[sample长度的设定](https://developer.apple.com/documentation/metal/mtlrenderpassdescriptor/2928281-imageblocksamplelength)  
[sample单位是Byte](https://developer.apple.com/documentation/metal/mtlrenderpipelinestate/2928215-imageblocksamplelength)  
看起来是因为，没有显式地设定sample length，于是自动按照color attachment来设定，于是encoder的sample length就是4，而shader中得出imageblock的sample length是16，进而pipelinestate的值是16，于是异常  
UE4中，设置RenderPassDesc的地方在`MetalStateCache.cpp`中  
是对`mtlpp::RenderPassDescriptor`类型进行设置，所以需要看第三方库中的`mtlpp`中的`render_pass.hpp`文件  
可以发现暴露出了`SetImageblockSampleLength`接口
## Support
按照官方给出的文档，在GPUFamilyApple4支持ImageBlock  
判断的代码一般写在`MetalRHI.cpp`