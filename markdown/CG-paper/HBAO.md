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
![](/img/HBAO-Figure-2.png)  
图像2，  
* (a) 绕着视方向$\vec{V}$的方位角$\theta$。切线角$t(\theta)$
* (b) 水平角$h(\theta)$是最大仰角$\alpha>=t(\theta)$，$\alpha < h(\theta)$
* (c) 
# 3 图像空间的积分
我们的算法将线性深度和视空间法线作为输入。对于每一个像素，我们计算他的视空间位置$P$并且采样存储在深度图中的高度场进行步进，用模特卡罗方法积分`公式3`。我们围绕$Z$轴采样$N_d$个像素，这些像素相对$P$的方向为$\theta$。对于每一个角度$\theta$，我们通过沿图像空间中的线段对深度图像进行采样来计算水平角$h(\theta)$。视空间影响半径$R$被投影到图像平面上，并被细分为$N_s$个等长的步长。  
为了将带状的瑕疵换成噪声，我们随机的抖动步进的尺寸并随机旋转方向。