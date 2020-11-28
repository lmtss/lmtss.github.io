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
  
波谱为  
$$
P_h(\vec{K})=A\frac{exp(-1/(kL)^2)}{k^4}|\vec{K}\cdot \vec{w}|^2
$$
* 公式中的$k$是指$\vec{K}$的模
* $\vec{w}$是指风向(wind大概)
## 高斯随机数
## IFFT