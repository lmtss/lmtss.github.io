4.24.1  
主要看的如何在插件中自定义meshcomponent以及相应的vertex shader(vertex factory)  
# NiagaraSceneProxy
`GetDynamicMeshElement`  
继承`FPrimitiveSceneProxy`需要实现的函数之一，用来解析场景中物体，构造成`FMeshBatch`，并将其塞到`FMeshElementCollector`中。  
在Niagara中，封装了一个NiagaraRenderer类，由这个类来处理SceneProxy的部分功能。比如GetDynamicMeshElement函数基本上是在各个NiagaraRenderer中实现的    
一个问题是，这个函数是何时被调用？是一帧调用一次还是当发生变化时被调用？  
看起来是每帧调用（至少动态物体的情况）。这样，就可以动态地调整`FMeshBatch`的属性