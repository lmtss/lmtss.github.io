<head>
    <script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>
    <script type="text/x-mathjax-config">
        MathJax.Hub.Config({
            tex2jax: {
            skipTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
            inlineMath: [['$','$']],
            displayMath: [['$$','$$'], ['\\(', '\\)']]
            }
        });
    </script>
</head>  


[原文](https://matthias-research.github.io/pages/publications/posBasedDyn.pdf)  
看到知乎上有人[介绍](https://zhuanlan.zhihu.com/p/48737753)了，内容基本来自原文
# 3 基于位置的模拟
在这一章我们将会讲述通用基于位置方法。对于布料模拟，我们将会给出一个特殊的方法。  
## 3.1 算法总览
假设一个有着$N$个顶点，$M$个约束的物体。顶点$i\in [1,...,N]$ 的质量为$m_i$，位置是$\vec{x_i}$ ，速度是$\vec{v_i}$  
一个约束$j\in[1,...,M]$  有如下组成  
## 3.4 碰撞侦测和反馈
PBD方式的一个优势是碰撞反馈的简单。连续碰撞和静态碰撞都能处理。对于连续碰撞，我们让每一个顶点$i$发出一个射线 $\vec{x_i} \to  \vec{p_i}$。如果这个射线进入一个物体，计算出入口位置$\vec{q_c}$ 以及表面法线$\vec{n_c}$。然后添加一个不等式约束到约束列表，这个约束函数是  
$$
C(\vec{p})=(\vec{p}-\vec{q_c})\cdot \vec{n_c}
$$  
相应的刚性为1。  
如果射线完全在物体内部，那么就认为连续碰撞检测失败，退回到静态碰撞。  
我们计算最靠近点$\vec{p_i}$的点$\vec{q_s}$，以及表面法线$\vec{n_s}$。添加一个不等式约束，公式基本同上。   
$$
C(\vec{p})=(\vec{p}-\vec{q_s})\cdot \vec{n_s}
$$  
碰撞约束的生成应该在结算循环外部，这样会让模拟更快。然而，当解算器使用固定的碰撞约束时，碰撞有可能miss。   
以上的关于碰撞的讨论只在物体是静态的情况下适用，因为没有将冲击传给碰撞对。正确的对两个动态物体的碰撞反馈也能解决，只需要将两个物体都用我们的模拟器来模拟。