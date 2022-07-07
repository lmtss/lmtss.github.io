AMD提供了FSR插件给UE4，需要4.27  
看了[知乎上的剖析](https://zhuanlan.zhihu.com/p/401030221)  
# 杂项
`Navi` 看起来是AMD的硬件系列  
`tap` 看起来像是采样的意思，应该是指利用pixel quad进行的行为，比如gather指令或者偏导
# 上采样EASU
## gather
看起来使用了12次gather，rgb各4次。  
也就是采样了周围12个像素，不清楚这种gather的方式和直接采样相比性能如何。  
在更差的机器上，只采样周围4个像素也是个方案。  
另外这个[shadertoy例子](https://www.shadertoy.com/view/wlGyzt)提到的gather方案，让我怀疑连续调用`gatherR` `gatherG` `gatherB`是否是三次采样，还是说一个quad内的4个线程都是只采样了一次rgb，然后通过quad内通信来gather。并且，相对于采样，gather应该会有线程同步的消耗，需要测试性能。  
ue4.27 创建一个后处理材质，用Gather、Sample、ddx的方式分别却获取四个像素  
* 如果将纹理标注为nearest或双线性，那么sample最快
* 如果标注为三线性，那么ddx最快
* ddx的做法比gather快
  
但是后处理显然不需要三线性  
这个测试用的是静态的纹理  
更换为动态生成的RT的话，双方优势都不明显   
gather的好处大概是，ddx无法知道当前线程位于quad的哪一个吧
## Shader Amortization using Pixel Quad Message Passing

## gather的次数
gather一次性4个像素，因此实际上4次gather了16个像素，有4个是无用的
## ddx
每个线程各自采样5次，即一个传统的上下左右中的filter，计算这一个的结果，然后通过ddx 、ddy获得其他三个线程的值，再插值  

gather和ddx的方式，都有同步的消耗；而sample
# FP16
UE4插件的代码中带有FP16变体，但是不给移动端开(2021-12-15)。查看shader能看到一些对FP16的处理，或许这里的精确度会在移动端出问题？  
在插件中`ffx_a.ush`和`ffx_fsr1.ush`中，能看到几个关于FP16的注释  
[参考](https://www.zhihu.com/pin/1176097684682895360)  
FSR中队类型的定义通常用的是`min16float`这样的，而不是`half`，然而在编译成`GLSL_ANDROID`的时候，会报错  
另外使用`min16int`找不到其他的
# Texture.Load
`Load`操作和`Sample`应该使用的是不同的单元
# 滤波器
总结来看，就是一个


# 代码翻译
## Const
在cpp中算出几个基于屏幕尺寸的参数  

```cpp
A_STATIC void FsrEasuCon(
outAU4 con0,
outAU4 con1,
outAU4 con2,
outAU4 con3,
// This the rendered image resolution being upscaled
// 输入图像的Viewport
AF1 inputViewportInPixelsX,
AF1 inputViewportInPixelsY,
// This is the resolution of the resource containing the input image (useful for dynamic resolution)
// 输入图像的RT的尺寸，UE中，降分辨率的话，这个值比上方的Viewport大
AF1 inputSizeInPixelsX,
AF1 inputSizeInPixelsY,
// This is the display resolution which the input image gets upscaled to
// 输出图像RT的尺寸
AF1 outputSizeInPixelsX,
AF1 outputSizeInPixelsY){

 // Output integer position to a pixel position in viewport.
 con0[0]=AU1_AF1(inputViewportInPixelsX*ARcpF1(outputSizeInPixelsX));   // (float)inputViewportInPixelsX / (float)outputSizeInPixelsX 输入的Viewport / 输出的
 con0[1]=AU1_AF1(inputViewportInPixelsY*ARcpF1(outputSizeInPixelsY));   // (float)inputViewportInPixelsY / (float)outputSizeInPixelsY
 con0[2]=AU1_AF1(AF1_(0.5)*inputViewportInPixelsX*ARcpF1(outputSizeInPixelsX)-AF1_(0.5));
 con0[3]=AU1_AF1(AF1_(0.5)*inputViewportInPixelsY*ARcpF1(outputSizeInPixelsY)-AF1_(0.5));
 // Viewport pixel position to normalized image space.
 // This is used to get upper-left of 'F' tap.
 con1[0]=AU1_AF1(ARcpF1(inputSizeInPixelsX));   //Viewport的逆
 con1[1]=AU1_AF1(ARcpF1(inputSizeInPixelsY));

 // 
 // Centers of gather4, first offset from upper-left of 'F'.
 //      +---+---+
 //      |   |   |
 //      +--(0)--+
 //      | b | c |
 //  +---F---+---+---+
 //  | e | f | g | h |
 //  +--(1)--+--(2)--+
 //  | i | j | k | l |
 //  +---+---+---+---+
 //      | n | o |
 //      +--(3)--+
 //      |   |   |
 //      +---+---+
 con1[2]=AU1_AF1(AF1_( 1.0)*ARcpF1(inputSizeInPixelsX));    //基于图示中F的Offset，表示图示中 (0)的位置
 con1[3]=AU1_AF1(AF1_(-1.0)*ARcpF1(inputSizeInPixelsY));
 
 // 下面的这三对二维向量，是基于 (0)的offset
 // These are from (0) instead of 'F'.
 con2[0]=AU1_AF1(AF1_(-1.0)*ARcpF1(inputSizeInPixelsX));    // (1)
 con2[1]=AU1_AF1(AF1_( 2.0)*ARcpF1(inputSizeInPixelsY));

 con2[2]=AU1_AF1(AF1_( 1.0)*ARcpF1(inputSizeInPixelsX));    // (2)
 con2[3]=AU1_AF1(AF1_( 2.0)*ARcpF1(inputSizeInPixelsY));

 con3[0]=AU1_AF1(AF1_( 0.0)*ARcpF1(inputSizeInPixelsX));    // (3)
 con3[1]=AU1_AF1(AF1_( 4.0)*ARcpF1(inputSizeInPixelsY));

 con3[2]=con3[3]=0;
 
 }
```  

```cpp
A_STATIC void FsrEasuConOffset(
    outAU4 con0,
    outAU4 con1,
    outAU4 con2,
    outAU4 con3,
    // This the rendered image resolution being upscaled
    AF1 inputViewportInPixelsX,
    AF1 inputViewportInPixelsY,
    // This is the resolution of the resource containing the input image (useful for dynamic resolution)
    AF1 inputSizeInPixelsX,
    AF1 inputSizeInPixelsY,
    // This is the display resolution which the input image gets upscaled to
    AF1 outputSizeInPixelsX,
    AF1 outputSizeInPixelsY,
    // 就是InputViewport.Rect.Min，Viewport的offset
    // This is the input image offset into the resource containing it (useful for dynamic resolution)
    AF1 inputOffsetInPixelsX,
    AF1 inputOffsetInPixelsY) {

    FsrEasuCon(con0, con1, con2, con3, inputViewportInPixelsX, inputViewportInPixelsY, inputSizeInPixelsX, inputSizeInPixelsY, outputSizeInPixelsX, outputSizeInPixelsY);

    // 
    con0[2] = AU1_AF1(AF1_(0.5) * inputViewportInPixelsX * ARcpF1(outputSizeInPixelsX) - AF1_(0.5) + inputOffsetInPixelsX);
    con0[3] = AU1_AF1(AF1_(0.5) * inputViewportInPixelsY * ARcpF1(outputSizeInPixelsY) - AF1_(0.5) + inputOffsetInPixelsY);
}
```
# EASU
* 采样得到12个像素值
* 计算4个kernel对应的边缘特征，并插值得到最后的 $\omega$
* 对12个像素中的每一个加权求和

## 边缘特征 FsrEasuSetF

```cpp
// 计算出四个kernel的边缘特征、w，然后做插值累加。
// 因此这个函数被调用 4次
// Accumulate direction and length.
 void FsrEasuSetF(
 inout AF2 dir,
 inout AF1 len,
 AF2 pp,
 AP1 biS,AP1 biT,AP1 biU,AP1 biV,
 AF1 lA,AF1 lB,AF1 lC,AF1 lD,AF1 lE){
  // Compute bilinear weight, branches factor out as predicates are compiler time immediates.
  //  s t
  //  u v
  AF1 w = AF1_(0.0);
  if(biS)w=(AF1_(1.0)-pp.x)*(AF1_(1.0)-pp.y);
  if(biT)w=           pp.x *(AF1_(1.0)-pp.y);
  if(biU)w=(AF1_(1.0)-pp.x)*           pp.y ;
  if(biV)w=           pp.x *           pp.y ;

```  

这里根据像素的位置得出这4个组的权值，基本就是像素距离哪一个组近，这个组的权值就高

```cpp
  // Direction is the '+' diff.
  //    a
  //  b c d
  //    e

  // Then takes magnitude from abs average of both sides of 'c'.
  // Length converts gradient reversal to 0, smoothly to non-reversal at 1, shaped, then adding horz and vert terms.
  AF1 dc=lD-lC;
  AF1 cb=lC-lB;
  AF1 lenX=max(abs(dc),abs(cb));
  lenX = 1.0 / lenX;
  AF1 dirX=lD-lB;
  dir.x+=dirX*w;
  lenX=saturate (abs(dirX)*lenX);
  lenX*=lenX;       //FX^2
  len+=lenX*w;      //w*FX^2

  // Repeat for the y axis.
  AF1 ec=lE-lC;
  AF1 ca=lC-lA;
  AF1 lenY=max(abs(ec),abs(ca));
  lenY = 1.0 / lenY;
  AF1 dirY=lE-lA;
  dir.y+=dirY*w;
  lenY=saturate(abs(dirY)*lenY);
  lenY*=lenY;       //FY^2
  len+=lenY*w;      //w*(FX^2 + FY^2)
  }
```   
横竖分别算了两次边缘特征  

$$
len=saturate(\frac{|lum_{left}-lum_{right}|}{max(|lum_{left}-lum_{center}|,|lum_{right}-lum_{center}|)})
$$

假设左右的值都比中间大，那么结果小于1；如果类似`right > center > left`，那么结果等于1。因此这个公式适合判断第二种的情况，也就是它想判断的边缘。   
另一个输出变量 dir，是梯度，也就是变化最大的方向，垂直于边缘，接下来用这个方向旋转。
## 处理边缘特征
```cpp
// Normalize with approximation, and cleanup close to zero.
AF2 dir2=dir*dir;
AF1 dirR=dir2.x+dir2.y;
AP1 zro=dirR<AF1_(1.0/32768.0);
dirR=APrxLoRsqF1(dirR);
dirR=zro?AF1_(1.0):dirR;
dir.x=zro?AF1_(1.0):dir.x;
dir*=AF2_(dirR);
```


```cpp
// Transform from {0 to 2} to {0 to 1} range, and shape with square.
len = len * 0.5;
len *= len;
// Based on the amount of 'edge',
// the window shifts from +/-{sqrt(2.0) to slightly beyond 2.0}.
AF1 lob= 0.5 + ((1.0/4.0-0.04)-0.5) * len;
// Set distance^2 clipping point to the end of the adjustable window.
AF1 clp=APrxLoRcpF1(lob);
```
这里的`lob`用来控制最后函数的形状，按照注释叫`Negative lobe strength`   
`clp`用来裁剪  
```cpp
// Stretch kernel {1.0 vert|horz, to sqrt(2.0) on diagonal}.
AF1 stretch=(dir.x*dir.x+dir.y*dir.y) / max(abs(dir.x),abs(dir.y));
// Anisotropic length after rotation,
//  x := 1.0 lerp to 'stretch' on edges
//  y := 1.0 lerp to 2x on edges
AF2 len2=AF2(AF1_(1.0)+(stretch-AF1_(1.0))*len,AF1_(1.0)+AF1_(-0.5)*len);
```  


[网上的FSR优化](https://atyuwen.github.io/posts/optimizing-fsr/)