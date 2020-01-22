## 序
### 词汇
`tile` 在该论文中，用来表示所有体素都具有相同值的空间区域。  
`active` 活跃，在bit mask里被编码，不是单指‘有没有’。  
## 构造
### 叶子节点
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
`sSize` 表示叶节点的尺寸、能包含多少个单元格，比如 8-8-8 共512个，则sSize = 512。  
`mFlags` 记录一个相对于全局坐标原点的坐标(3*20 bits)，以及其他信息。
`mValueMask` 一个mask，记录某个单元格是否活跃。  
`mLeafDAT` 记录体素的值信息，或文件流。  
### 中间节点
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
## 访问