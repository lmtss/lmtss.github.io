`asperity` 粗糙  
`empirical` 经验  
`rim` 边缘  
`sheen` 光泽  
`hue` 色调  
`velvet` 丝绒  
# 9.10 
在微观几何方面，衣服一般和其他类型的材质不同。根据纤维类型，可能有高度重复的微结构。所以，布料表面需要特殊的着色模型，比如各向异性的高光、粗糙散射(由光线穿过纤维散射引起的明亮边缘)  
布料BRDF模型包括三个主要方向：经验模型、微表面模型、微纤维(cylinder)模型。下面讲解几个显著的例子。  
## 9.10.1 布料经验模型
在游戏 神秘海域2 中，布料表面使用如下漫反射BRDF项:  
$$
f_{diff}(l, v)=\frac{\rho_{ss}}{\pi}(k_{rim}((v\cdot n)^+)^{a_{rim}}+k_{inner}(1-(v\cdot n)^+)^{a_{inner}}+k_{diff})
$$  
其中，  
* $k_{rim}$ 边缘光
* $k_{inner}$ forward-facing
* $k_{diff}$ Lambert项  

显然，这只和view方向有光，和光照无关。  
在 [825 神秘海域4](http://advances.realtimerendering.com/s2016/The%20Process%20of%20Creating%20Volumetric-based%20Materials%20in%20Uncharted%204.pptx) 中，对于高光项，依据服装类型选择使用微表面或微纤维模型；使用一个‘warp lighting’经验次表面散射估计值作为漫反射项  
$$
f_{diff}(l,v)(n\cdot l)^+\xRightarrow{}\frac{\rho_{ss}}{\pi}(c_{scat}+(n\cdot l)^+)^{\mp}\frac{(n\cdot l+\omega)^{\mp}}{1+\omega}
$$
## 9.10.2 微表面布料
为了建模丝绒，使用了一个逆高斯NDF。这个NDF又被进行了一定的修改，来建模通用的材质。  
通用的丝绒NDF：  
$$
D(m)=\frac{}{}
$$
## 9.10.3 微纤维布料
这种建模方式十分相近于头发，所以一定程度上可以参考14.7.2。这种想法相当于假设表面被一维的线所覆盖。  
比如，神海4使用了Kajiya-Kay BRDF来建模丝绸、丝绒的高光。  
Dreamworks [348](https://research.dreamworks.com/wp-content/uploads/2018/07/38-0045-deshmukh-Edited.pdf) [1937]()使用相对简单并容易调参的模型来描述纤维。  
[Sadeghi 1526](http://graphics.ucsd.edu/~henrik/papers/practical_microcylinder_appearance_model_for_cloth_rendering.pdf) 