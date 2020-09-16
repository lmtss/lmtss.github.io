`quantitative` 定量的  
`intuition` 直觉  
`transmittance` 透过率  
`optical depth` 光学深度  
`propagating` 传播
`photon` 光子
`punctual light` 在空间中表示为一个点的灯光，非面光源  
`lobe` 叶、耳朵  
`portray` 描绘、写真  
`splatting` 喷溅  
`heterogeneous` 错杂  
`epipolar line` 对极线[wiki](https://en.wikipedia.org/wiki/Epipolar_geometry#Epipolar_line)  
`stochastic` 随机的  
`drawback` 缺陷

luminance graycale: $Y=dot((0.2126, 0.7152, 0.0722), rgb)$
  
# 14章 透明体积渲染
`Participating media` 参与媒介？  
描述了充满粒子的体积。这种媒介参与光线的传播，换句话说，他们会对`经过散射或吸收并穿过他们的光线`产生影响。  
在9.1章写到，漫反射着色模型是微层面上光线散射的结果。
## 14.1 光线散射理论
在9.1.1和9.1.2描述了对散射、吸收等物理现象的定量处理。辐射transfer公式`[479, 743, 818, 1413]`关于multiple scattering路径追踪  
这里我们专注于`single scattering`。  
## 14.1.1 材质
有四种情况会影响光的传播。  
* `Absorption 吸收` $\sigma_a$ 光子被介质吸收，转化为其他能。  
* `Out-scattering` $\sigma_s$ 
* `Emission` 介质自发光，比如火
* `In-scattering` $\sigma_s$ 从任意方向散射到当前光路并贡献到最终辐射度的光子。   
   
`in-sacttering`和`emission`添加光子到路径；`absorption`和`out-scattering`减少光子，有$\sigma_t=\sigma_a+\sigma_s$。  
散射和吸收系数决定了介质的反照率$\rho$，即  
$$
\rho=\frac{\sigma_s}{\sigma_s+\sigma_a}=\frac{\sigma_s}{\sigma_t}
$$  
这代表着散射相对于吸收的权重，$\rho$的值在[0,1]之间。  

如9.1.2中讨论，介质的表现是散射和吸收属性的结合。真实世界中介质的系数值已经被测量并发布[1258][Acquiring Scattering Properties of Participating Media by Dilution](https://cseweb.ucsd.edu/~ravir/dilution.pdf)。没有云雾的系数，倒也正常。  

这些属性、情况都是和光的波长相关的。理论上，应该用光谱值`spectral value`来渲染；从效率上考虑，使用RGB来代替。$\sigma_s$、$\sigma_a$等值对应的RGB应该预先使用`color-matching`函数算出光谱值(8.1.3章)。  
  
所以，单条光线的公式可以被描述为
$$
L_i(c,-v)=T_r(c,p)L_o(p,v)+\int_{t=0}^{||p-c||}T_r(c,c-vt)L_{scat}(c-vt,v)\sigma_sdt
$$
## 14.1.2 透过率
$$
T_r(X_a,X_b)=e^{-\tau}, where\quad\tau=\int_{X=X_a}^{X_b}\sigma_t(X)||dX||
$$  
这种关系也被叫做`Beer-Lambert Law`。光学深度 $\tau$ 是无量纲的，表示光的衰减量。经过的距离越长，$\tau$越大，透过的光越少。  
## 14.1.3 散射
对in-scattering的积分表示为  
$$
L_{scat}(X,V)=\pi\sum_{i=1}^{n}p(V,l_{c_i})v(X,P_{light_i})c_{light_i}(||X-P_{light_x}||)
$$  
* $n$是灯光数量
* $p(X,l_{c_i})$是相函数`phase function`
* $v(X,P_{light_i})$是可见性函数
* $l_{c_i}$是灯光到该位置的方向
* $c_{light_i}(dist)$是灯光的辐射度，与距离有关。9.4章定义，5.2.2的平方反比falloff
$$
v(X,P_{light_i})=shadowMap(X,P_{light_i})*volShad(X,P_{light_i})
$$
$$
volShad(X,P_{light_i})=T_r(X,P_{light_i})
$$
## 14.1.4 Phase Functions
participating介质是由不同半径的粒子组成的。这些粒子尺寸的分布会影响光线散射到相对于原本方向的另一条方向的可能性。背后的物理在9.1解释。  
最简单的phase函数是  
$$
p(\theta)=\frac{1}{4\pi}
$$  
可以注意到，对phase函数的积分为1。  
基于物理的phase函数和相对尺寸$s_p$有关  
$$
s_p=\frac{2\pi r}{\lambda}
$$
* $s_p\ll1$，是`Rayleigh scattering`，如 空气
* $s_p\approx1$，是`Mie scattering`
* $s_p\gg1$，是`geometric scattering`  
## Mie Scattering
### HG phase 函数
$$
Phg(\theta,g)=\frac{1-g^2}{4\pi(1+g^2-2gcos\theta)^{1.5}}
$$  
### Schlick phase 函数
对HG的近似，效率更高
$$
p(\theta,k)=\frac{1-k^2}{4\pi(1+kcos\theta)^2},\quad k\approx 1.55g-0.55g^3
$$  
## 14.3.2 渲染Participating介质
渲染介质的结果需要受各种因素影响，比如天气、day、环境变更。森林中的雾看起来与在午夜、尘土中的雾不同。爆炸产生更多灰尘、减少障碍物。Light Shaft受树的形状影响，当树被移除，Light Shaft也应受影响。营火、闪电、其他光源都应该产生在空气中的散射。本节讨论实时模拟这种动态视觉现象的技术。  

### constant材质+shadowed大范围
有两种技术专注于渲染单源的shadowed大范围散射。都假设是constant材质，而非participating材质  
* 一种方法是深度法[1958]。这种技术基于对[对极线](https://en.wikipedia.org/wiki/Epipolar_geometry#Epipolar_line)采样in-scattering，。灯光视角的depthmap用来决定采样是否shadowed。  
  没完全看懂，应该是raymarch采样shadowmap，然后skip掉深度相同的地方。
* 另一种是通过depthmap创建一个mesh  

这两种技术不能计算来自非不透明表面、  
### 喷溅法
使用蓝噪声，可以产生一种均匀的噪声值[539]视频:["The Rendering of inside",GDC](https://www.youtube.com/watch?v=RdN06E6Xn9E&feature=youtu.be)pdf:[pdf](https://github.com/playdeadgames/publications/tree/master/INSIDE)。这样做能够产生更顺滑的视觉效果，当上采样并混合双边滤波。使用四个随机采样也能实现上采样半分辨率(Up-sampling the half-resolution buffer can also be achieved using four stochastic samples blended together)。结果会十分的noisey，因为相当于给full屏幕的每一个像素都进行noise，这能够简单的通过TAA后处理解决(5.4)。  
### 切片法
Wronski[1917]提出了一个使用3Dtexture的切片方法，texture中像素对应于view clip space。经典的实现中，在xy上使用1/8的分辨率，z则是64片。texture中包含辐射度$L_{scat_{in}}$的RGB表示 并将 $\sigma_t$存储在alpha。  
最终体积效果通过从近到远迭代所有切片来绘制  
$$
V_f[x,y,z]=(L_{scat}^{'}+T_r^{'}L_{scat_{in}}d_s,T_{r_{slice}}T_r^{'})
$$  
$$
L_{scat}^{'}=V_0[x,y,z-1]_{rgb}
$$
$$
T_r^{'}=V_0[x,y,z-1]_a
$$
$$
T_{r_{slice}}=e^{-\sigma_td_s}
$$
根据切片$z-1$来渲染切片$z$，此时$d_s$是切片间的世界空间的距离。  
注意到，在上面公式中，$L_{scat_{in}}$仅受前一切片的透过率$T_r^{'}$影响。这是不正确的，应该也受当前切片的透过率影响。  
Hillaire[742,743]讨论了这个问题，他提出了一个相关于常系数$\sigma_t$解析式来积分$L_{scat_{in}}$  
$$
V_f[x,y,z]=(L_{scat}^{'}+\frac{L_{scat_{in}}-L_{scat_{in}}T_{r_{slice}}}{\sigma_t},T_{r_{slice}}T_r^{'})
$$
