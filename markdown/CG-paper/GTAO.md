`Practical Realtime Strategies for Accurate Indirect Occlusion`  
# 1 介绍
环境光遮蔽是一种对全局光照的近似，它对小遮挡物产生的阴影进行了建模。  
我们介绍了一系列新的屏幕空间的遮挡技术，目标是让实时的结果媲美光线追踪的ground truth结果。我们提出了一个新颖的AO技术，叫做GTAO，它将AO和近距离的间接光照分离(什么意思？)。这使我们能够通过避免分段积分（在使用遮挡估计器时需要）来有效地解决环境遮挡积分，同时通过使用有效的基于物理的函数近似来恢复丢失的多个散射漫射照明。     
我们的贡献是：  
* `GTAO：`一种高效的环境光遮蔽技术，可媲美radiometrically-correct的环境光遮蔽积分，并使用简单的封闭形式分析表达式将因近距离间接照明而损失的能量纳入其中。
* `Directional GTAO：`
* `Specular occlusion(SO)：`
* `GTSO：` 
# 3 Background & Overview
来自点$x$的反射辐射度$L_r(x,\omega _o)$可以被建模为：  
$$
L_r(x,\omega _o)=\int _{H^2}L(x,\omega _i)f_r(x,\omega _i,\omega _o)max(dot(n,\omega _i))d\omega _i
$$  
环境光遮蔽[ZIK98]近似了这个公式，通过介绍一系列假设  
* 所有$x$周围的表面是完全吸收的(并不反弹光)
* 所有的光来自于无限远的均匀白色环境光
* 位于$x$的表面是一个`Lambertian`表面  
得到了以下结果  
$$
L_r(x,\vec{\omega _o})=L_i\frac{\rho (x)}{\pi}A(x)\int _{H^2}V(x,\vec{\omega _i})cos(\vec n,\vec {\omega _i})d\vec{\omega _i}=
$$  