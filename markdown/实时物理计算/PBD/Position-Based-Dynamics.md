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
* 