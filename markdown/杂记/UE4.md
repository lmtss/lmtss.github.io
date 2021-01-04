## depthfade
在移动端，使用$scenedepth-pixeldepth$计算时，发现水面上有黑块，随后发现是因为在水下缺少物体的情况下，$scenedepth$的值和PC上表现不一，会导致$saturate(scenedepth-pixeldepth)$为0，进而透明度为0，也就变成了clearcolor的颜色  

后来的另一种情况，并没有缺失背景，但是透明度为0，水面消失。原因是$\frac{scenedepth - pixeldepth}{dist}$中的$dist$参数过大导致的，可能由于玄妙的精度问题
## 马赛克
初步看以为是UV按time位移，而time过大导致的。目前用`custom`节点计算UV
## uniform变量
从cpu传过来的变量，在未勾选全精度的情况下，确实会是half，这一点可以在编译的glsl代码里面看出，如此的话，就算使用custom节点也不管用  
转移到VS计算custom UV也不行，可以看GLSL，传过来的参数仍没有highp
## uniform 变量是怎么填充到模板的
## 材质模板
## landscape
只支持三个自定义UV  
详情见`LandscapeVertexFactory.ush`
## 粒子播放序列帧
`ParticleSpriteVertexFactory.ush` 中 `GetVertexFactoryIntermediates`  
## 纹理压缩
### 扰动、位移类型的纹理压缩
像是ETC等方式，会使用块状压缩，这应该是扰动效果出现块的原因。毕竟默认是为了颜色来准备的
### 纹理解码发生在何处？
纹理是否能够仅仅消耗RG通道相应的带宽?如果不能的话，法线压缩的意义是仅仅是省内存？
## 在Custom节点采样
* 普通的
tex.Sample(texSampler, uv)  
texture(tex, uv)  
等同于直接用`TextureSample`节点
* 法线
直接用`TextureSample`采样法线，映射到`[-1,1]`并且将解码压缩纹理
* 关于采样器  
在GL代码里面，并没有采样器增加的问题
## UE4如何保证CustomUV是高精度  
在`MaterialTemplate.ush`里的`GetMaterialCustomizedUVs`函数  
在`HLSLMaterialTranslator.h`的`Translate`函数里填充
## 法线
在编写水面的时候，发现计算后的法线不需要连接到`reflect`节点，直接连到最终的`normal`引脚即可  
这个地方在`HLSLMaterialTranslator.h`-812处(4.24)有注释，会提前把`PixelParametersInput.Normal`赋值，这样以后使用像素法线的时候，就都是最终结果了
## 位置和缩放
## Compute Shader
使用`ES31`预览会报错，无法找到shader  
修改`ShouldCache`和`ShouldCompilePermutation`，让其根据是否支持`ES3.1`来判断即可
## 死亡粒子特效
### cs
cs读取mesh，  
```
if 当前vertex的local position处在某个位置区间
    赋给粒子buffer[index]该vertex的位置
```  
无法计算`index`
### transformback
令粒子初始化位置为mesh位置,随后按照local position逐渐飞走  
最简单的实现
### transformback 2.0
在渲染时，`Draw(start, num)`，调节start  
需要排序
### cs 2.0
## uniform buffer
是否有限制？
## rgba float
能否储存负数？  
没有问题，不过用蓝图的drawmaterialtorendertarget时，别忘了设置 "允许自发光为负数"
## 奇怪的耗时
使用IFFT计算海面的时候，gpu profiler上有一段时间消耗不知道来自哪里
几个疑点
* compute shader输出的资源需要同步，就是说memory barrier  
但是渲染出的效果并没有问题
* PSO
### 测试
* spectrum-> IFFT x2 -> copy -> spectrum -> IFFT x2  
即是说，不做第二次的copy，奇怪的耗时不会出现在worldtick里面，存在mobilescenerenderer里面，但不再任何一个项里面  

* 在使用ES3.1 PIE运行的情况下有可能消失
* 完全取消插件中的计算，单纯用蓝图`draw material to rt`，发现也存在这个耗时，所以和compute shader无关
* 完全不用蓝图的tick，发现其实还是有这个耗时
# G8
PF_G8不是指使用g通道，而是指grayscale 8，所以PF_G8仍是R8
