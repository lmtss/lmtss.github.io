[Hierarchical hp-Adaptive Signed Distance Fields](https://animation.rwth-aachen.de/media/papers/2016-SCA-HPSDF.pdf)   

# 摘要
本文提出了一种新的方法来构建层次自适应的有向距离场。我们在轴对⻬的六⾯体⽹格上使⽤分段多项式将网格的有向距离场离散化。除了基于⼋叉树细分的空间细化来细化单元⼤⼩ (h) 之外，我们还分层增加每个单元的多项式次数 (p) 以构建准确且节约内存的表示。我们提出了⼀个新的标准来决定是应⽤ h-refinement 还是 p-refinement，我们证明了我们的⽅法能够以⽐以前的⽅法显着降低的内存消耗构建更准确的SDF。  
# 介绍
在计算机图形学中，有向距离场是个常用的工具，它能用于表面重建、渲染、建模、碰撞检测[MASS15](https://dl.acm.org/doi/10.1145/2816795.2818100)。  
构建SDF最普遍的方法是采样规则六面体网格顶点处的有向距离场，并在单元格内进行三线性插值，比如[XB14b](https://dl.acm.org/doi/pdf/10.5555/2619648.2619655)。然而，对于复杂物体，这种离散化策略会消耗大量内存也不准确。一个实现是[FPRJ00](https://dl.acm.org/doi/10.1145/344779.344899)，使用八叉树来减少内存消耗。    

本文中，我们提出了一个新方法来高效地构建基于grid的SDF。

# 相关
关于图形学中的有向距离场，可以看[JBS06](https://www.cs.swan.ac.uk/~csmark/PDFS/df.pdf)做一个概览。   
在基于物理的动画的领域，SDF十分适合做碰撞检测。SDF能够快速地进行与潜在碰撞物体的距离查询。SDF的梯度，能够用来找到通往表面的最短路径，能被用来作为碰撞反馈的接触法线。[BMF03](https://www.cs.ubc.ca/~rbridson/docs/cloth2003.pdf)和[FSG03](https://www.graphicon.ru/html/2003/Proceedings/Technical/paper495.pdf)使用SDF解决布料和刚体之间的碰撞。[XB14a](https://viterbi-web.usc.edu/~jbarbic/ccd/XuBarbicVRIPHYS2014.pdf)提出了一个用于刚体的连续碰撞检测。  
在本文中，我们还展示了我们新的 SDF 表示在刚体碰撞检测应用领域的使用。然而，通过[MZS*11](https://dl.acm.org/doi/10.1145/2010324.1964932)提出的修改，我们的SDF也能被应用于刚体-变形物体、变形物体-刚体之间的碰撞检测。  