# 总体思路
UE4中计算天光球谐是基于`pixelshader`，对于每一个系数，都运行一次投影操作  
投影则是对每个面进行多次下采样来实现一个累加  
但是实际上并不需要多次的结果存为纹理，球谐系数往往只需要很少的存储空间  
各种意义上，下采样过程中都有很大浪费  
用compute shader会比较合理  
## 均匀采样
直接用球坐标系，设置均匀的$\theta$和$\phi$必定是不均匀的，在顶部和底部会相对聚集  
那么一个简易方式是反函数，用已知均匀的采样，逆推出所需的$\theta$和$\phi$  
### 参考  
* [stackoverflow](https://stackoverflow.com/questions/5408276/sampling-uniformly-distributed-random-points-inside-a-spherical-volume)  
* [Generating uniformly distributed numbers on a sphere](http://corysimon.github.io/articles/uniformdistn-on-sphere/)  
* 
### 结论  
$$
\theta = arccos(1-2u)
$$
$$
\phi = 2\pi v
$$  
### 大致
* 首先，希望对于每一个方向$v$，其概率是一样的，也就是说$p(v)=c$，即常函数。
* 对于球面面积有$\int\int dA=4\pi$，而理论上概率的积分应为1，则有  
$\int\int p(v)dA=1$得出$p(v)=\frac{1}{4\pi}$  
* 当我们用$(\theta,\phi)$描述概率时，有$\int\int dp(\theta,\phi)=1$  
* 也就是说,$p(\theta,\phi)=\frac{1}{4\pi}sin\theta$  
* 从目的来看，需要的是$\theta=Func(u)$这样的函数，  
而我们有$F_{\theta}(\theta)=G(u)$，以及$F_{\phi}(\phi)=H(v)$，边缘分布函数与均匀分布的$u,v$的对于关系。简单的来看，$G(u)=u$
* 那么求$F_{\theta}$
* $f(\theta)=\int_0^{2\pi}p(\theta,\phi)d\phi=\frac{sin\theta}{2}$  
$f(\phi)=\int_0^{\pi}p(\theta,\phi)d\theta=\frac{1}{2\pi}$  
* $F_{\theta}(\theta)=\int_0^{\theta}f(\theta)d\theta=\frac{1-cos\theta}{2}$  
 $F_{\phi}(\phi)=\int_0^{\phi}f(\phi)d\phi=\frac{\phi}{2\pi}$
* 然后求逆函数即可