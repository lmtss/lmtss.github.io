# NVIDIA brief
[英伟达一篇短文](https://developer.download.nvidia.com/whitepapers/2006/Mipmapping_Normal_Maps.pdf)  
[翻译](https://www.jianshu.com/p/efabea28ed1a)  
[翻译](https://blog.csdn.net/toughbro/article/details/39248549)  
基于一个观察：当法线被平均时，结果的长度越短，说明原来被平均的法线间夹角越大  
那么在材质shader中，读取带有mipmap的法线后根据其长度来得出夹角的近似结果来获得光泽度(或用作粗糙度)  
## 具体
根据这个观察，可以将这种关系视作正太分布  
$$
|N|=\frac{1}{1+\Sigma}\leftrightarrow \sigma ^2=\frac{1-|N|}{|N|}
$$
高光计算  
$$
\frac{1+f_ts}{1+s}(N_{normalized}\cdot H)^{f_ts}
$$
$$
f_t=\frac{1}{1+s\sigma ^2}=\frac{|N|}{|N|+s(1-|N|)}
$$
## 实际应用
* 首先使用rg通道压缩的方式就不行了，无法获取mipmap处理后的$|N|$  
* 其次使用`n * 0.5 + 0.5`来处理的话，在平均时能否符合夹角与长度的关系？  
应该仍是符合的，经推算以及实验都可证明
# 其他方案
[RTR-9-13-normal filter](https://gunay-pi.com/chapter-9-physically-based-shading/13/)  
[NDF](https://zhuanlan.zhihu.com/p/69380665)  
[楚留香](https://zhuanlan.zhihu.com/p/35369939)  
# cubemap
采样cubemap的时候，同样出现了锯齿  
那么思路就是计算cubemap的mipmap值，以及乘数。大概就是修改`k * sample(uv, level)`，中的`k`和`level`  
改变`k`的想法是，如果一个像素表现的是远处的物体，那么这个像素的颜色更可以理解为多个采样的平均，尤其是在物体凹凸不平的情况下，实际应有的颜色值应该比简单的采样cubemap得出的值要小  
但是否应该这样？因为mipmap也反应了采样的平均  
按照上面[英伟达的短文](https://developer.download.nvidia.com/whitepapers/2006/Mipmapping_Normal_Maps.pdf)，应使用一个$log_2\sigma$的函数来计算，不过没给出公式  
不过在网上随便找一个在线函数绘图网站，观察$log_2\sigma$图像，能发现这个函数在$|N|$大于0.5时小于0  
UE4中采样反射捕获的代码也是类似，根据$log_2(roughness)$来计算  
$MaxMip-1+MipScale*log_2(r) - RoughestMip$  
其中$MipScale$为1.2，$RoughestMip$为1