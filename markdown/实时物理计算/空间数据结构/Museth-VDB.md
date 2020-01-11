翻译学习论文 [VDB: High-Resolution Sparse Volumes with Dynamic Topology](http://www.museth.org/Ken/Publications_files/Museth_TOG13.pdf)  
这篇论文感觉上主要是从CPU编程的角度写，不过思想肯定可以用到GPU上了，比如NVIDIA的GDVB。按我的理解，就是八叉树+均匀网格，叶子节点是均匀网格。
## 词汇
cache-coherent 缓存一致性  
是指在采用层次结构存储系统的计算机系统中，保证高速缓冲存储器中数据与主存储器中数据相同机制。
## 摘要
我们开发出一个层次数据结构，该结构能高效表示稀疏、随时间变化的在3D网格上离散化的体数据。我们的‘VDB’之所以如此命名，是因为它是一个体积(V)、动态(D)网格，和B+树有几个相似的特征，利用时变(time-varying)数据的空间一致性来对数据值和网格拓扑分别进行分离、紧凑编码。VDB表示几乎无限的3D索引空间，允许在高分辨率的稀疏体数据中的快速数据访问和缓存一致性。它在体数据的稀疏上没有拓扑限制，并提供快速的(平均O(1))随机访问，当数据插入、取、删除。因为VDB是层次的，它也能提供自适应网格采样。
## Previous Work
## 2 VDB 数据结构
从前面的列表可以推测出，VDB包含一个压缩动态数据结构和几个算法。虽然他们显然是相互依存的，但我们分别地介绍他们。
## 2.1 概念和类比
一个VDB背后的核心想法是，在一个相似于B+树的层次数据结构中，动态管理grid的块。块是非循环连接图的相同固定深度处的叶节点，图具有大但可变的分支数，分支数是二的幂。这意味着树的高度是平衡的，但是宽。这有效的减少了树的深度，减少了从上到下遍历所需的I/O操作。有人认为VDB仅仅是一种八叉树、N-树，这样的比较是很肤浅的，因为VDB的真正价值在于它独特的实现(section 3)。  
## 2.2 Terminology
## 2.3 块的构造
尽管可以用许多不同的方式配置(configured)VDB，我们将描述适用于所有配置的组件，从叶节点开始到根节点结束，之后是关于所有节点的数据结构的讨论。  
`Direct access bit masks.` 位掩码是VDB的一个存在于不同节点中基础组件。位掩码提供了对节点上二进制表示的拓扑结构的快速又紧凑的访问，并且，据我们所知，我们是第一个同时实现下面几个特点的人：  
(1) 层次拓扑编码  
(2) 快速顺序迭代  
(3) 少损失压缩  
(4) 布尔运算  
(5) 对各种算法的高效实现  
所有的这些操作对于应用于流体、窄带水平集、体模型的动态稀疏数据结构来说是必要的。  
`Leaf nodes.` 这些节点是最低层的块，并且在同一个深度。他们将空间高效地分为不重叠的域，每个域沿着每个轴有\\(2^{Log_2\omega}\\)个体素，\\(2^{Log_2\omega}\ =\ 1,2,3....\\)。典型的配置是\\(2^{Log_2\omega}\ =\ 3\\)，按照8-8-8的块。我们限制叶节点(和内节点)的维数为2的幂，借此，我们能在遍历树的时候进行快速的位运算。  
```cpp
template <class Value, int Log2X, int Log2Y=Log2X, int Log2Z=Log2Y>
class LeafNode { 
    static const int sSize=1<<Log2X+Log2Y+ Log2Z, sLog2X=Log2X, sLog2Y=Log2Y , sLog2Z=Log2Z; 
    union LeafData { 
        streamoff offset;//out -of-core streaming 
        Value* values;//temporal buffers 
    } mLeafDAT;//direct access table 
    BitMask <sSize > mValueMask;//active states 
    [BitMask <sSize > mInsideMask]; //optional for LS 
    uint64_t mFlags;//64 bit flags 
};
```  
在上面的代码中可以看出，叶节点的维度在编译期决定，节点的大小是\\(1\ll \sum_ \omega sLog_2\omega\\)。叶节点将体素数据值编入Direct Access Table，将活跃的体素拓扑编入direct access bit-mask。重要的是要注意，尽管位掩码的固定大小等于LeafNode的大小，但由于以下原因，值数组的大小mLeafDAT.values是动态的。  
![](/img/VDB-tree.webp "VDB-tree")  
## 2.4 Putting it All Together
任何空间数据结构的单一配置都不能声称能够同样好地处理所有应用程序，并且VDB也不例外，因此，它是专为自定义设计的。节点及其参数的不同组合会改变树的深度和分支因子，从而影响诸如可用网格分辨率，适应性，访问性能，内存占用量甚至硬件效率等特性。
## 3 VDB 访问算法
到目前为止，我们仅专注于VDB数据结构，该结构仅占我们贡献的一半，可以说是更简单的一半。另一半涉及有效的算法和优化技巧的工具箱，用于导航和操作此动态数据结构。我们将在本节中重点介绍树访问算法，并在下一节中讨论更多针对特定应用的技术。  
## 3.1 随机访问
最基本最有挑战的就是对任意体素的随机访问。最糟糕的情况下，每个体素访问都需要完整的从上到下的遍历。