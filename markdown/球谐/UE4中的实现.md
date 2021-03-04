看到UE4中采样天光的SH系数是用点乘来做，一时没有想到是怎么个方式
# UE4
`ReflectionEnvironmentDiffuseIrradiance.cpp`中的`ComputeDiffuseIrradiance`是计算漫反射SH系数的函数，看起来是系数画到RT然后回读。  
总体分为四步
* `DiffuseIrradianceCopyPS`  读取lightingSource,计算球谐系数
* `DiffuseIrradianceAccumulatePS`  累加，降采样到1x1x6的cubemap
* `AccumulateCubeFacesPS`  读取1x1x6的cubemap的六个面，累加并输出到2D纹理
* 前三步循环，计算所有系数
* 回读2D纹理到cpu

在`SceneRendering.cpp`中会把球谐系数变换为便于点乘计算的形式  
天光计算在`ReflectEnvironmentCapture.cpp`里面，即使是用cubemap指定(`SpecifiedCubemap`)，也是在这里

注释中提到参考了[Stupid Spherical Harmonics (SH) Tricks](https://www.ppsloan.org/publications/StupidSH36.pdf)  中的点乘做法，而这篇文章引用了[An Efficient Representation for Irradiance Environment Maps](https://cseweb.ucsd.edu/~ravir/papers/envmap/envmap.pdf) 这篇   
其中采样球谐系数的公式大略为  
$$
E(\vec{n})=c_1L_{22}(x^2-y^2)+c_3L_{20}z^2+c_4L_{00}-c_5L_{20}  \\
+2c_1(L_{2-2}xy+L_{21}xz+L_{2-1}yz)\\
+2c_2(L_{11}x+L_{1-1}y+L_{10}z)
$$  
实际上点乘做法就是将系数做了个变换，从上面的$\sum C_{lm}Y_{lm}(\vec{n})$的形式换成点乘，节省指令