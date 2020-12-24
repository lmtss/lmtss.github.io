看了`Jerry Tessendorf`2001的论文，加上网上其他的文章，大概理解了FFT在水面中的应用  
## Tessendorf.J 2001
论文中提到的核心内容是FFT中的系数(振幅)的计算方式，有了系数，就可以通过IFFT算出位移量  
对于水面总体位移方向$\vec{K}$，频率 $\omega$，时间$t$，振幅有
$$
h(\vec{K},t)=\widetilde{h}_0(\vec{K})e^{i\omega t}+\widetilde{h}_0(-\vec{K})e^{-i\omega t}
$$  
其中  
$$
\widetilde{h}_0(\vec{K})=\frac{1}{\sqrt{2}}(\xi_r+i\xi_i)\sqrt{P_h(\vec{K})}
$$
* $\xi_r+i\xi_i$是高斯随机数计算出的，静态的即可。$\xi_r$和$\xi_i$平均值为0，方差为1
* $P_h(\vec{K})$是波谱  
  
Phillips波谱为  
$$
P_h(\vec{K})=A\frac{exp(-1/(kL)^2)}{k^4}|\vec{K}\cdot \vec{w}|^2
$$
* 公式中的$k$是指$\vec{K}$的模
* $\vec{w}$是指风向(wind大概)
* 注意$|\vec{K}\cdot \vec{w}|$中的$\vec{K}$代表方向，需要normalize
## 高斯随机数
## IFFT
对于该问题，属于一个二维的IFFT，一般是横竖进行两次即可  
### share memory的尺寸问题
是否可以直接取一个大小为256或128的线程组?  
如何分成block的？比如128x1和32x4的区别，如果share memory只是32份的话，128x1的场合会发生什么？  
需要尝试32一块，然后有一次全局同步的情况  
sharememory在SM上面
### bank confilct
如果一个thread输出两个结果的方式  
### 一个thread输出两个

## 旋转因子
生成旋转因子lut，当最终纹理大小为NxN时，lut的大小应为$(log_2N,N)$  
在cs中，旋转因子计算式应有   
$$
k=\frac{y\cdot N}{2^{x+1}}modN
$$
$$
W_N^k=exp(2\pi\frac{k}{n}i)=cos(\frac{2\pi k}{N})+isin(\frac{2\pi k}{N})
$$ 
应该可以换成$log_2N, \frac{N}{2}$大小的lut  
或者只在初始时读取一次(倒序)
## 码位倒序
在stage==1的时候(第一次计算时)，并不是按照`h(0,m,t),h(1,m,t),h(2,m,t),....`这样取值，并非`0,1,2,...`而是`0,4,2,6,....`  
在二进制中，这两者的二进制位时相反的，所以可以在生成lut时算好
## 蝶形
需要判断当前是`topwing`还是`bottomwing`，就是说判断是在当前蝶形运算中处于上面还是下面  
$$
istop=y\,\, mod\,\,2^{x+1}<2^x
$$
## 换成buffer
不使用texture作为中间量的存储
## sync
`GroupMemoryBarrierWithGroupSync`  
`GroupMemoryBarrier`

# 尝试优化
在PC上，256x256，仅计算高度图，需0.08ms
* 波谱20us
* IFFT 约29us x 2
* 绘制到RT约8us  

为啥波谱的计算消耗是绘制RT的两倍多？
## ps与cs
cs在输出结果到纹理的时候，不比ps快，ps对于z-order之类的格式有优化  
所以，如果计算较为简单，那么cs的瓶颈就会在输出到纹理部分，于是就会失去对比ps的优势  
在使用ps计算发现并copy的情况下，读取纹理5次，renderdoc显示约13us，仍小于cs计算波谱
## 改为一个线程两个输出
在PC上效果不显著
### Lut
Lut改为$(log_2N, \frac{N}{2})$大小  
## lut 改为rgba8
在256x256时，8位二进制可以表示足够的数，但是需要对浮点数进行解码
## 最后一步输出改为8位
## 创建H0的时候
把$h0(\vec{K})$和$h0(\vec{-K})$放到xy和zw里，这样在计算某时间$t$对应的频谱时，只需读取一次纹理  
或许可以凭此把H0减少到一半尺寸？
# 改进
## Stockham
初始时不需要码位反转，那么码位反转就不需要lut了  
```
FFT(x,y,N,Ns,input)
{
    base = floor(x/Ns)*(Ns/2);
    offset = x mod (Ns/2)
    x0 = base + offset
    x1 = x0 + N/2
    complex_0 = input[x0,y]
    complex_1 = input[x1,y]
    angle = -2PI*(x/Ns)
    w = expToComplex(angle)
    ...
}
```
## 不去实时生成D(K, t)
D(K, t)和FFT的尺寸相同，完全可以把生成D(K, t)的生成迁移到IFFT中
## 一次性计算Displacement
## 减弱反方向波
## cs输出两个纹理 vs 两次ps
## 白沫
$$
J(\vec{x})=J_{xx}J_{yy}-J_{xy}J_{yx}
$$
$$
J_{xx}(\vec{x})=1+\lambda \frac{\partial D_x(\vec{x})}{\partial x}
$$  
$$
J_{yy}(\vec{x})=1+\lambda \frac{\partial D_y(\vec{x})}{\partial y}
$$  
$$
J_{yx}(\vec{x})=\lambda \frac{\partial D_y(\vec{x})}{\partial x}
$$  
$$
J_{xy}(\vec{x})=\lambda \frac{\partial D_x(\vec{x})}{\partial y}=J_{yx}
$$  
此处有$\vec{D}=(D_x,D_y)$  
在实现上倒是比较简单
$$
ddx=\frac{tex(x_c+offset).xy-tex(x_c-offset)}{dist}
$$
$$
J=(1+\lambda ddx.x)(1+\lambda ddy.y)-\lambda ddx.y*\lambda ddy.x
$$  
雅可比行列式在此处可以表示 $\vec{x}$ 转换到 $\vec{x}+\lambda D(\vec{x})$ 之后的形变  
* 0 < J < 1 代表被压缩，相当于邻域的多个顶点变得聚集
* j > 1 代表被拉伸
* j < 0 则可以理解为压缩过度，以至于原本在a点右边的b，移动到了a点的左边
## 战争雷霆浪尖白沫
`J < M`来判断是否是破碎的浪尖，破碎的浪尖视作白沫的发生源，有着最密集的白沫。随着时间，这些发生源就会扩散/消散并形成普通白沫。  
可以使用方向模糊来模拟普通白沫
### 仅仅读上一次白沫图，多帧加和
在计算法线时，同时计算白沫，读取上一次的白沫图，乘$e^{-deltaTime}$消散项加到这次的白沫上。  
这种方式中，普通泡沫的范围取决于帧数和海浪的速度，若要保证普通泡沫的正常表现，模糊仍是最好的操作。  
不过看起来还好  
* 问题一，白沫较为明显，在纹理tile重复读高时增加重复感  
只显示近处的白沫可规避这个问题
* 问题二，雅可比为负的区域(白沫源头)存在突变，应该是因为渐变机制不够好
  * 调节参数，令上一帧的白沫偏移量减小，解决突然消失的白沫
  * 
* 问题三，上一帧和当前帧的结果大体一致，感觉只是像平移了一样
* 问题四，波浪的前进方向那一边的部分应该适当减弱
  * 因为法线可以和白沫一起计算，所以可以用$dot(normal.xy,waveDir)$判断时在波浪的哪一边
* 问题五，上一帧的加和出现的比较突然
### item
在ps使用ddx ddy计算雅可比不可取
### 模糊
# mesh
## 投影网格
我觉得是个很好的解决方法
## 多级投影网格
# SSS
参考Crest Ocean System  
他在PPT中提到，使用水平位移量作为SSS的强度，水平位移量需要除以波长  
* 问题一，IFFT得出的位移量已经是各种波累加的结果，不可能分别除以各种波长  
  * 在PPT前面可以看出，此处的波长不是指波谱中的波长，而是对应多分辨率海面的层级，每一个层级对应一个粗略的波长
* 问题二，为何水平位移量能代表SSS强度？
  * 顶端和最底端的水平位移是0
* 问题三，浪尖处的displacement长度为0，表现为很黑
  * 修改模型，改为使用$length(float3(disp.x, disp.y, max(disp.z)))$
# crest ocean
[github地址](https://github.com/crest-ocean/crest)  
## 法线
他们的shader里面的normal不是预先生成到纹理的，而是在海面shader里面采样右下中三个坐标的纹理叉乘的  
采样的纹理中alpha存储SSS强度
## 法线2
除了用displacement生成的normal(geometry normal)之外，还支持从外部传入的normalmap用作细节
## SSS
说是结合了水平方向的displacement和波峰mask  
## foam生成
也是使用雅可比行列式
## foam
在VS中采样foam强度纹理，在PS中采样foam纹理  
这样的话，foam的强度就是一个大致的区域，foam的细节shape通过foam纹理来表示
## 层级
在海面shader中，
# 分层
## 同一张纹理
使用同一张FFT计算的纹理可能导致
# shading 
## 简单光照
对于简单的`pow(max(dot()),spec)`方式，尝试让spec在远近不一

# bug
## 竖条
纹理中出现很多像素值为nan，分布呈竖条  
查明，是初始频谱菲利普值在$|\vec{K}|$过小时，值过大导致的，因为在频谱的全局$A$项设置了10  

## 某一时刻所有频率的高度都为0
## mipmap
实时计算的mipmap有问题，出现奇妙的瑕疵点  
经测试，瑕疵点属于mipmap级别较高的地方
* 使用根据depth计算的绝对mipmap，让mipmap不会过高
* 在UE4查看纹理的mipmap，发现一些像素值是(0,0,0,0)，但在renderdoc上不能复现
* 改为RGBA8之后消失
## normal filter
### UE4 generate mips
UE4中有CS生成和api生成两种方式  
`GenerateMips.cpp Execute`
### 使用自带的mipmap
* 与精度无关，uv的大小小于10，取小数无用
* 使用硬件计算的mipmap并不合适
### 方案
* disp生成的法线平滑一些
* 使用absolute的mipmap值
* 改变采样normal之后的操作
  * 这个方案很好地消除了高光走样
* 自己生成mipmap(暂不使用)