目的是要在插件中写一个primitive component，要包括自定义的vertex shader，通常来说意味着新的vertex factory  
# Build.cs
用到的依赖需要写在这里  
* Core
* CoreUObject
* Engine
* RHI
* RenderCore
* Renderer  
* Projects  

比较常用
# 自定义的shader路径
新建一个路径，存放插件的shader  
```cpp
#include "Interfaces/IPluginManager.h"
//实际路径，通常都是在 /插件名/Shaders/ 下，所以这么写
RealShaderDirectory = FPaths::Combine(
    IPluginManager::Get().FindPlugin(TEXT("插件名"))->GetBaseDir(),
    TEXT("Shaders")
);
//虚拟路径，代码中使用的路径
VirtualShaderDirectory = ...
//映射
AddShaderSourceDirectoryMapping(VirtualShaderDirectory, RealShaderDirectory);
```
# 创建组件
不清楚如何直接用cpp创建，个人选择在编辑器中上方 `文件`按钮下，`新建c++类`，选择`Actor组件`，之后相关文件就自动创建好了。  
虽然个人想要的是一个直接继承`UPrimitiveComponent`的模板，但无大碍，直接改掉就好  
继承了`UPrimitiveComponent`之后自带transform、物理相关的处理  
```
/**
 * PrimitiveComponents are SceneComponents that contain or generate some sort of geometry, generally to be rendered or used as collision data.
 * There are several subclasses for the various types of geometry, but the most common by far are the ShapeComponents (Capsule, Sphere, Box), StaticMeshComponent, and SkeletalMeshComponent.
 * ShapeComponents generate geometry that is used for collision detection but are not rendered, while StaticMeshComponents and SkeletalMeshComponents contain pre-built geometry that is rendered, but can also be used for collision detection.
 */
```    
## bound
将组建绘制到屏幕上，首先要经过cpu的视锥剔除，要定制包围和的话，就要实现`CalcBounds`函数  
```cpp
//这么写的话，基本上一定会在视锥内
FBoxSphereBounds UYQPhysicsComponent::CalcBounds(const FTransform& LocalToWorld) const
{
	return FBoxSphereBounds(LocalToWorld.GetLocation(), FVector(1000000.0f, 1000000.0f, 1000000.0f), 1000000.0f);
}
```
## SceneProxy
SceneProxy存储了用来渲染的信息，比如材质、顶点工厂等等  
其中重要的就是`GetDynamicMeshElements`函数，这个函数会创建`MeshBatch`，收集网格信息。MeshBatch随后会变成command，最后变成提交的绘制指令(drawindexed等等)  
```cpp
//组建类中实现这样的函数
FPrimitiveSceneProxy* UMyComponent::CreateSceneProxy()
{
	return new UMySceneProxy(this);
}
```  
```cpp
//实现SceneProxy还要实现的函数
SIZE_T GetTypeHash() const override
{
    static size_t UniquePointer;
    return reinterpret_cast<size_t>(&UniquePointer);
}

virtual uint32 GetMemoryFootprint(void) const override { return(sizeof(*this) + GetAllocatedSize()); }

uint32 GetAllocatedSize(void) const { return(FPrimitiveSceneProxy::GetAllocatedSize()); }
```
## MeshBatch
```cpp
struct FMeshBatch
{
	TArray<FMeshBatchElement,TInlineAllocator<1> > Elements;

	/** Vertex factory for rendering, required. */
	const FVertexFactory* VertexFactory;

	/** Material proxy for rendering, required. */
	const FMaterialRenderProxy* MaterialRenderProxy;
    
    //略
    ........
}
```
接下来编写`GetDynamicMeshElements`函数  
```cpp
//通常是这样的形式
for (int32 ViewIndex = 0; ViewIndex < Views.Num(); ViewIndex++)
{
    if (VisibilityMap & (1 << ViewIndex))
    {
        FMeshBatch& Mesh = Collector.AllocateMesh();
    
        //填充FMeshBatch

        FMeshBatchElement& BatchElement = Mesh.Element[0];

        //填充BatchElement

        Collector.AddMesh(ViewIndex, Mesh);
    }
}
```