# emmm
`mean` 平均值  
`deviation` 方差 

# 4 经验模型
## 4.1 Gerstner波
这种物理模型将波浪描述为表面上个体point的运动。近似中，当波浪经过，表面的点是周期性(圆周)运动的。假设，在不受波浪影响时，有一点$X_0=(x_0,z_0)$且高度有$y_0=0$。然后一个高为$A$的波浪经过，那么该点有：  
$$
X=X_0-(K/k)Asin(K\cdot X_0-\omega t)  
$$
$$
y=Acos(K\cdot X_0-\omega t)
$$  
表达式中，向量$K$是一个水平向量，描述了波浪前进的方向，而$k$相关于波长$\lambda$  
$$
k=2\pi /\lambda
$$  
## 4.2 几个相关性
## 4.3 基于统计的波浪模型 and 傅里叶变换
在统计模型中，波浪的高度被估计为水平位置和时间的随机值，$h(X,t)$   
统计模型可以将波浪的高度场分解为一系列sin和cos波的和。  
基于FFT的波浪高度场将位于$X=(x,z)$处的高度$h(X,t)$表达为复杂、波高相关于时间的正弦波的和：  
$$
h(X,t)=\sum_K \widetilde{h}(K,t)exp(iK\cdot X)
$$
* $\vec K = (k_x,k_z)$
* $k_x=2\pi n/L_x$
* $k_z=2\pi m/L_z$
* $-N/2<=n<N/2$
* $-M/2<=m<M/2$

FFT产生位于离散点$X=(nL_x/N,mL_z/M)$的高度场。 
## 4.4 构建随机海洋波浪高度场
$$
\widetilde{h}_0(\vec{K})=\frac{1}{\sqrt{2}}(\xi_r+i\xi_i)\sqrt{P_h(\vec{K})}
$$

## 4.6 汹涌的波浪
在FFT中，2D位移通过高度场的傅里叶程度来计算：  
$$
D(\vec{x},t)=\sum_k -i\frac{\vec{k}}{k}\widetilde{h}(\vec{k,t})exp(i\vec{k}\cdot \vec{x})
$$  
根据此向量场，水平上的点的位置是$\vec{x} + \lambda D(\vec{x},t)$  
使用雅可比矩阵判断浪尖白沫:  
$$
J(\vec{x}) = J_{xx}J_{yy}-J_{xy}J_{yx}
$$  
其中  
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
雅可比的符号代表是否有重叠的浪(浪尖白沫区域)，当$J$小于0时代表有重叠。   