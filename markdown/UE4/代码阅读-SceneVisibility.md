
## GatherDynamicMeshElements
遍历场景中的Primitive，对每个Primitive运行`ComputeDynamicMeshRelevance`函数  
### ComputeDynamicMeshRelevance
顾名思义，这部分代码描述了如何把`Primitive`分配到各个`Pass`  