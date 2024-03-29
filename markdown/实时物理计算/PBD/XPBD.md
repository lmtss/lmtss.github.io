看了知乎上[这篇解析](https://zhuanlan.zhihu.com/p/406652407)

# 3 Background
PBD可以被认为是一个使用Verlet方式的半隐式积分。投影步骤是使用每个约束函数的局部线性化和质量加权校正来执行的。PBD 约束求解器的主要步骤是计算每个约束的位置增量   
$$
\delta x = k_js_jM^{-1}\nabla C_j(x_i)
$$  
此处的下角标 $i$指代迭代index，$j$指代约束index，$k\in [0,1]$是约束刚性(简单相乘)。缩放系数 $s$由下面的公式给出   
$$
s_j=\frac{-C_j(x_i)}{\nabla C_jM^{-1}\nabla C^T_j}
$$

简单地用 $k$缩放的副作用是刚性以来时间步和约束数量。