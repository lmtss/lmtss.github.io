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