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
  
Phillips波谱为  
$$
P_h(\vec{K})=A\frac{exp(-1/(kL)^2)}{k^4}|\vec{K}\cdot \vec{w}|^2
$$
* 公式中的$k$是指$\vec{K}$的模
* $\vec{w}$是指风向(wind大概)
## 高斯随机数
## IFFT
对于该问题，属于一个二维的IFFT，一般是横竖进行两次即可  
### share memory的尺寸问题
是否可以直接取一个大小为256或128的线程组?  
如何分成block的？比如128x1和32x4的区别，如果share memory只是32份的话，128x1的场合会发生什么？  
需要尝试32一块，然后有一次全局同步的情况  
sharememory在SM上面
### bank confilct
如果一个thread输出两个结果的方式  
### 一个thread输出两个

## 旋转因子
生成旋转因子lut，当最终纹理大小为NxN时，lut的大小应为$(log_2N,N)$  
在cs中，旋转因子计算式应有   
$$
k=\frac{y\cdot N}{2^{x+1}}modN
$$
$$
W_N^k=exp(2\pi\frac{k}{n}i)=cos(\frac{2\pi k}{N})+isin(\frac{2\pi k}{N})
$$ 
应该可以换成$log_2N, \frac{N}{2}$大小的lut  
或者只在初始时读取一次(倒序)
## 码位倒序
在stage==1的时候(第一次计算时)，并不是按照`h(0,m,t),h(1,m,t),h(2,m,t),....`这样取值，并非`0,1,2,...`而是`0,4,2,6,....`  
在二进制中，这两者的二进制位时相反的，所以可以在生成lut时算好
## 蝶形
需要判断当前是`topwing`还是`bottomwing`，就是说判断是在当前蝶形运算中处于上面还是下面  
$$
istop=y\,\, mod\,\,2^{x+1}<2^x
$$
## 换成buffer
不使用texture作为中间量的存储
## sync
`GroupMemoryBarrierWithGroupSync`  
`GroupMemoryBarrier`