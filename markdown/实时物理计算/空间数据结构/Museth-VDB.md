翻译学习论文 [VDB: High-Resolution Sparse Volumes with Dynamic Topology](http://www.museth.org/Ken/Publications_files/Museth_TOG13.pdf)  
这篇论文感觉上主要是从CPU编程的角度写，不过思想肯定可以用到GPU上了，比如NVIDIA的GDVB。类似八叉树。
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
VDB在概念上为无限大的3D索引空间（x，y，z）建模，尽管实际上它自然受到索引的位精度和可用内存的限制。 编码为VDB的数据包含通过模板定义的Value类型和对应的离散索引（x，y，z），这些索引指定其空间样本位置，即树结构内值的拓扑。 为了方便起见，我们有时会使用符号w来共同表示三个笛卡尔坐标方向之一。我们将最小的体积元素成为体素，在图2中为红色。每个体素都有一个数据域。体素分为active和inactive。这两种状态的含义在不同应用中有不同的解释，一般来说，active代表重要的或有趣的(interesting)。比如，在标量密度网格中，inactive体素为默认的背景值(比如 0)。对于窄带水平集，窄带内所有体素都是active的，其他的体素都是inactive的且有着恒定的非零距离，图3。更准确地，拓扑隐式地编码在bit mask里，数值显式地存储于任何层级节点的buffer里。可以使用存储在树的适当级别的单个值来表示所有体素都具有相同值的索引空间区域，如图3所示。我们将使用术语tile值来表示这些较高级别的值。像体素一样，图块可以是活动的或不活动的。
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
    [BitMask <sSize > mInsideMask]; //optional for LS 水平集可选
    uint64_t mFlags;//64 bit flags 
};
```  
在上面的代码中可以看出，叶节点的维度在编译期决定，节点的大小是\\(1\ll \sum_ \omega sLog_2\omega\\)。叶节点将体素数据值编入Direct Access Table，将活跃的体素拓扑编入direct access bit-mask。重要的是要注意，尽管位掩码的固定大小等于LeafNode的大小，但由于以下原因，值数组的大小mLeafDAT.values是动态的。  
![](/img/VDB-tree.webp "VDB-tree")  
首先，对于某些应用，可以通过各种压缩技术显着减少mLeafDAT的内存占用量。 我们支持几种不同的编解码器，包括利用活动体素拓扑（即mValueMask）和水平集的内部/外部拓扑（即mInsideMask）以及更传统的基于熵和位截断方案的编解码器。有关详细信息，请参见附录A。其次，为了最好地简化数字时间积分，LeafNode可以包含多个值缓冲区，每个值缓冲区都存储不同时间级别的体素。例如，三阶准确的TVD-RungeKutta方案[Shu and Osher 1988]需要三个时间缓冲区。最后，体素值也可以驻留在核外，这可以通过偏移到文件流中来实现。请注意，此偏移量不会导致额外的内存开销，因为它是在mLeafDAT中以C++联合编码的。
值缓冲区的可变数量和大小以及有关LeafNode的其他信息都紧凑地编码在64位变量mFlags中。请参见图5。前两位编码四种状态：0个缓冲区，即值在核外；1个缓冲区，即不支持时间积分的内核值；2个缓冲区，即在内核中的值。支持一阶和二阶时间积分或3个缓冲区的核心值，即支持三阶时间积分的核心值。如果块被压缩，则第三bit是on；第四bit是on，则叶子被位量化(bit-quantized)。剩余的3*20位用于对全局原点进行编码。事实证明，这非常方便，因为可以通过将mValueMask中编码的局部体素拓扑与来自mFlags的全局节点起源相结合来导出全局体素坐标。因此，LeafNode是独立的，不需要引用其父节点，这减少了内存占用并简化了体素坐标的推导。  
`Internal nodes.` 如同名字所暗示，这些节点在根与叶子节点之间，存在于树所有的中间层级，并且决定了树(B+树)的深度和形状。  
```cpp
template <class Value, class Child, int Log2X, 
int Log2Y=Log2X, int Log2Z=Log2Y> 
class InternalNode { 
    static const int sLog2X=Log2X+Child::sLog2X, 
                    sLog2Y=Log2Y+Child::sLog2Y, 
                    sLog2Z=Log2Z+Child::sLog2Z, 
                    sSize=1<<Log2X+Log2Y+Log2Z; 
    union InternalData { 
        Child* child;//child node pointer 
        Value value;//tile value 
    } mInternalDAT[ sSize]; 
    BitMask <sSize > mValueMask;//active states 
    BitMask <sSize > mChildMask;//node topology 
    int32_t mX, mY, mZ;//origin of node 
};
```   
就如看到的，中间节点的构造和叶节点有一部分相同。然而，不像叶节点，中间节点同时记录值和树的拓扑，也就是说，有着指向其他中间节点或叶节点的指针。相应的拓扑在位掩码mChildMask中进行了紧凑编码，并且mValueMask用于指示图块值是否处于活动状态。请注意，由于分支因子Log2w在编译时是固定的，因此mInternalDAT，mChildMask和mValueMask的大小也是固定的。需要强调的是，不同层次的中间节点可以有不同的分支因子，这样就能增加灵活性以适应所有形状的树。这是重要的，因为树结构会影响内存占用量和计算性能，这会在章节5.1中讲述。  
## 2.4 Putting it All Together
任何空间数据结构的单一配置都不能声称能够同样好地处理所有应用程序，并且VDB也不例外，因此，它是专为自定义设计的。节点及其参数的不同组合会改变树的深度和分支因子，从而影响诸如可用网格分辨率，适应性，访问性能，内存占用量甚至硬件效率等特性。
## 3 VDB 访问算法
到目前为止，我们仅专注于VDB数据结构，该结构仅占我们贡献的一半，可以说是更简单的一半。另一半涉及有效的算法和优化技巧的工具箱，用于导航和操作此动态数据结构。我们将在本节中重点介绍树访问算法，并在下一节中讨论更多针对特定应用的技术。  
## 3.1 随机访问
最基本最有挑战的就是对任意体素的随机访问。最糟糕的情况下，每个体素访问都需要完整的从上到下的遍历。实践中，随机访问能通过改变遍历顺序得到很好的改进，在3.2中我们在讲。使用比较、对立的方式能更容易地给随机访问下定义，它既不是顺序访问也不是基于模板的访问。  
`Random lookup 随机查找` 是最常用的随机访问。我们首先确定从RootNode开始遍历树所需的基本操作。显然这些操作依靠于mRootMap的实际实现，让我们从简单的std::map开始。我们从计算有符号的rootKey开始访问在坐标(x,y,z)处的体素。  
```cpp
int rootKey[3] = {
    x & ~((1<< Child::sLog2X)-1),
    y & ~((1<< Child::sLog2Y)-1),
    z & ~((1<< Child::sLog2Z)-1)
};
```  
结果值是包含(x,y,z)的子节点原点的坐标，因此避免了哈希冲突。这个key被用来在mRootMap里面搜索，mRootMap用rootKey的字典顺序存储RootData。如果未找到任何结果，则返回背景值(mBackground)，并且如果找到一个图块值，则返回该上层值。
无论哪种情况，遍历都将终止。但是，如果找到子节点，则遍历将继续进行，直到遇到图块值或达到LeafNode为止。仅有的修改是将std::map替换为哈希map，就像google::dense_hash_map[[sparsehash 2009]()]，是个很好的哈希函数，它能产生均匀分布的随机数。我们结合之前提到的 rootKey 和被Teschner [[2003]()]提出的哈希函数。  
```cpp
unsigned int rootHash = ((1<<Log2N)-1) & (
    rootKey [0]*73856093 ^
    rootKey [1]*19349663 ^
    rootKey [2]*83492791
);
```  
这三个常数是质数,^是XOR操作，&是AND操作。我们将Teschner [[2003]()]提出的哈希函数做了改进，将取模操作改为AND操作。接下来，如果internalOffset处的mChildMask的位为off，则(x,y,z)位于常量图块内，因此从mInternalDAT返回该图块值，并终止遍历。否则，将从mInternalDAT中提取子节点，并继续遍历直到在InternalNode的mChildMask中遇到零位或达到LeafNode。相应的，LeafNode的直接访问偏移(direct access offset)的计算速度甚至更快。  
当遇到了一个InternalNode，使用下面的偏移量计算方式。  
```cpp
unsigned int internalOffset = 
(
    ((x&(1<<sLog2X)-1) >> Child::sLog2X)<<Log2YZ
) + 
(
    ((y&(1<<sLog2Y)-1) >> Child::sLog2Y)<<Log2Z
) + 
(
    (z&(1<<sLog2Z)-1) >> Child::sLog2Z
);
```  
\\(Log_2YZ = Log_2Y + Log_2Z\\)。 编译时，算式会被编译为3个与操作、5个shift、2个加法。接下来，如果internalOffset处的mChildMask是off，(x,y,z)位置上是一个constant tile，那么就返回这个tile值并结束遍历。否则，子节点从mInternal DAT中提取出，继续遍历知道遇到一个0 bit或遇到一个叶子节点。对LeafNode的direct access offset的计算更快。
```cpp
unsigned int leafOffset = 
    (
        (x&(1<<sLog2X)-1) << Log2Y+Log2Z
    ) + 
    (
        (y&(1<<sLog2Y)-1) << Log2Z
    ) + 
    (
        z&(1<<sLog2Z) - 1
    );
```  
代码会被编译为3个位AND操作，2个位左移，2个加法。  
