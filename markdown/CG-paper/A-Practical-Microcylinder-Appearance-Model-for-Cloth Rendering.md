[Sadeghi 1526](http://graphics.ucsd.edu/~henrik/papers/practical_microcylinder_appearance_model_for_cloth_rendering.pdf) 

`patch` 补丁  
`weave` 编织  
`portion` 一部分  
`coverage` 覆盖 

# 1 intro
我们的模型基于对布料散射的测量。基于这些测量，我们开发出了一种用来渲染纺织物的经验模型，这种模型考虑了通过纤维的光线散射。模型考虑了产生于纤维间的阴影和masking。模型容易控制，可以描述众多纤维，包括麻布、丝绸、丝绒、涤纶。  
模型的主要优势是对特定的纤维类型采取直观(经验的？)的参数。和通用的微表面模型不同，我们的模型容许对线条的颜色和发光进行控制，并能准确的定义编制的结构。 
# 3 通过面料的散射
## 3.1
讲了一下测量方式
## 3.2
# 4 线的散射
## 4.3 线的散射模型

# 5 模型
我们将布料看作一种由众多圆柱体构成的mesh，这种圆柱体朝向两种正交的方向。这些圆柱，相较于布料的几何体来说十分的小。如4.3所探讨，我们不使用表面的法线来模拟散射，只需要布料层面的切线方向。不过在计算阴影的时候仍需要法线。  
## 5.1 着色模型
为了渲染布料，我们计算从编织的最小patch中透出的辐射度。这个patch是指编织方式的最小组成部分，即是说，整个编织物可以被重复的patch构成(似乎是比一般布料的tile还要小)。每个patch有同一组切线。  
(figure 12)  
右上方的曲线表示水平的线的切线曲线，简单理解的话，去看2D平面的截面的话，就是曲线的模样。  
我们假设最小patch在局部上是平坦的并且小于像素。如大部分编织方式，最小patch由两个方向正交的线组成。不过根据公式，将最小patch延伸为任意数量的线也行。  
我们定义最小patch的辐射度是线加权平均，线的辐射度基于局部的方向和覆盖范围(图11)。  
$$
L_r(\omega_r)=a_1 \times L_{r,1}(\omega_r) + a_2 \times L_{r,2}(\omega_r)
$$  
* $a_1$ 第一个线的覆盖范围
* $a_2$ 第二条线的覆盖范围  

如果编织模式是watertight(防水的，应该指没有空隙)，则$a_1+a_2=1$。  
对任一线，我们定义一个切线曲线描述切线分布。通过放置离散的控制点来设置切线。  
根据曲线来计算线的BRDF，对每一个切线方向$j$有  
$$
L_{r,j}(\omega_r)=\frac{1}{N_j}\sum_t\int L_i(\omega_i)f_s(t,\omega_i,\omega_r)cos\theta_id\omega_i
$$  
* $N_j$指切线的采样数
* $f_s$指线的BSDF模型的解析式，在4.3介绍