
## GatherDynamicMeshElements
遍历场景中的Primitive，对每个Primitive运行`ComputeDynamicMeshRelevance`函数  
### ComputeDynamicMeshRelevance
顾名思义，这部分代码描述了如何把`Primitive`分配到各个`Pass`，看起来静态物体不在此处处理  
```cpp
PassMask.Set(EMeshPass::BasePass);
View.NumVisibleDynamicMeshElements[EMeshPass::BasePass] += NumElements;
```  
同时对于一些特殊的物体，有其他的渲染方式，比如体积材质、MeshDecal  
```cpp
if (ViewRelevance.bHasVolumeMaterialDomain)
{
    View.VolumetricMeshBatches.AddUninitialized(1);
    FVolumetricMeshBatch& BatchAndProxy = View.VolumetricMeshBatches.Last();
    BatchAndProxy.Mesh = MeshBatch.Mesh;
    BatchAndProxy.Proxy = MeshBatch.PrimitiveSceneProxy;
}
```  
这样考虑的话，新增一种渲染方式的话，就在`SceneRendering.h`中声明对应的结构体，就像  
```cpp
struct FVolumetricMeshBatch
{
	const FMeshBatch* Mesh;
	const FPrimitiveSceneProxy* Proxy;
};
```  
在`FViewInfo`中保存
## 新增一个渲染物体方式的流程
### SceneRendering.h
```cpp
struct FXxxBatch
{
	const FMeshBatch* Mesh;
	const FPrimitiveSceneProxy* Proxy;
};
```  
### FViewInfo
添加`FXxxBatch`的数组
### FPrimitiveViewRelevance
`\Engine\Source\Runtime\Engine\Public\PrimitiveViewRelevance.h`  
添加对应flag
### SceneVisibility.cpp
将带有相应ViewRelevance的flag的Mesh添加到FViewInfo中的FXxxBatch数组  
动态物体和静态物体在不同的地方添加
### flag赋值
通常在各种`Component`的`SceneProxy`中都会实现`GetViewRelevance`方法  
