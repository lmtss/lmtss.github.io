看了半天也没懂UE4是如何用法线方向和系数点乘得出结果的  
简单的思考球谐的投影和重建  
* 投影，求出系数c
* 重建  
$$
f(s)=c_1y_1(s)+c_2y_2(s)+c_3y_3(s)+...
$$  
UE4的点乘显然属于重建部分

# UE4
`ReflectionEnvironmentDiffuseIrradiance.cpp`中的`ComputeDiffuseIrradiance`是计算漫反射SH系数的函数，看起来是系数画到RT然后回读。  
总体分为三步
* `DiffuseIrradianceCopyPS`  读取lightingSource,计算球谐系数
* `DiffuseIrradianceAccumulatePS`  累加，降采样到1x1x6的cubemap
* `AccumulateCubeFacesPS`  读取1x1x6的cubemap的六个面，累加并输出到2D纹理
* 前三步循环，计算所有系数
* 回读2D纹理到cpu

注释中提到参考了[Stupid Spherical Harmonics (SH) Tricks](https://www.ppsloan.org/publications/StupidSH36.pdf)  