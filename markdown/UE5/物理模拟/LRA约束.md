# LRA约束的生成
在chaos的代码中，能够找到`ClothTetherData.cpp`，直译是布料的系绳，也算是很好的描述了LRA约束。    
构建的过程包含在`FClothTetherDataPrivate`的构造函数当中   
首先会调用`ComputeKinematicNodeIslands`来寻找布料中固定点构成的连通域   
然后据此来调用`GenerateEuclideanTethers`或者`GenerateGeodesicTethers`来计算系绳  

## 动力学节点


## 构成约束

在`GenerateEuclideanTethers`中，每一个非固定点会去遍历所有的固定点连通域，找到连通域中最近的点，构成一个约束，有n个固定点连通域，就有n个约束   

```
for 连通域 in 连通域列表
    for 固定点 in 连通域
        找距离最近的固定点 i以及距离 d

    将pair[d, i]填入列表
```