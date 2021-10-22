`Image-space horizon-based ambient occlusion`   
# 1 介绍
ao公式
$$
A=1-\frac{1}{2\pi}\int V(\vec{\omega})W(\vec{\omega})d\omega
$$
# 2 Horizon-Based Ambient Occlusion
我们使用的球面坐标系的z轴和视方向$\vec{V}$对齐。我们使用一个用水平角$h(\theta)$定义的水平线分割单位球。假设$P$的附近是连续的高度场，已知通常在地平线以下追踪的光线与遮挡物相交，因此可以省略对这些光线的相交测试。在连续高度场的假设下，可以有：  
$$
A=1-\frac{1}{2\pi}\int _{\theta=-\pi}^{\pi}\int _{\alpha =t(\theta)}^{h(\theta)}W(\vec{\omega})cos(\alpha)d\alpha d\theta
$$  
我们使用线性衰减函数$W(\theta)=max(0,1-r(\theta)/R)$，其中$r(\theta)$是$P$和水平位置在方向$\vec{\omega}$上的距离，$R$是影响半径。因此有  
$$
A=1-\frac{1}{2\pi}\int _{\theta=-\pi}^{\pi}(sin(h(\theta))-sin(t(\theta)))W(\theta)d\theta
$$
# 3 图像空间的积分