我在尝试UE5分支的时候出现的问题
# 编译
编译时报错  
```
'HeadlessChaos': System.IO.DirectoryNotFoundException: Could not find a part of the path 'D:\UE5\UnrealEngine-5.0\Engine\Restricted\NotForLicensees\Build'.
```  
字面意思就是缺一个目录，新建一个就好了  
参考[ue5-5-0-branch-build-error-chaos](https://forums.unrealengine.com/t/ue5-5-0-branch-build-error-chaos/260629/6)  
个人用的是vs2019
# FVector4f

```cpp
BEGIN_SHADER_PARAMETER_STRUCT(FParameters, )
SHADER_PARAMETER(FVector4f, NormalParams)   //写成FVector4的时候报错
END_SHADER_PARAMETER_STRUCT()
```
```cpp
PositionBufferA.Initialize(
	TEXT("SimPositionBufferA")
	, sizeof(FVector4f)	//这里我以前用的是FVector，现在sizeof(FVector)是32，所以和PF_A32B32G32R32F不符
	, VertexBufferLength
	, EPixelFormat::PF_A32B32G32R32F
	, BUF_UnorderedAccess | BUF_ShaderResource
	, nullptr
	);
```
# FStructuredBuffer
```
FStructuredBufferRHIRef is deprecated, please use FBufferRHIRef. Please update your code to the new API before upgrading to the next release, otherwise your project will no longer compile
```

# FRWBuffer::Initialize
这个函数改了  
```cpp
void Initialize(const TCHAR* InDebugName, uint32 BytesPerElement, uint32 NumElements, EPixelFormat Format, ERHIAccess InResourceState, EBufferUsageFlags AdditionalUsage = BUF_None, FResourceArrayInterface *InResourceArray = nullptr);
```


# IMPLEMENT_VERTEX_FACTORY_TYPE_EX
这个宏没了  

UE4的LocalVertexFactory
```cpp
IMPLEMENT_VERTEX_FACTORY_TYPE_EX(FLocalVertexFactory,"/Engine/Private/LocalVertexFactory.ush",true,true,true,true,true,true,true);
```

UE5的LocalVertexFactory
```cpp
IMPLEMENT_VERTEX_FACTORY_TYPE(FLocalVertexFactory,"/Engine/Private/LocalVertexFactory.ush",
	  EVertexFactoryFlags::UsedWithMaterials
	| EVertexFactoryFlags::SupportsStaticLighting
	| EVertexFactoryFlags::SupportsDynamicLighting
	| EVertexFactoryFlags::SupportsPrecisePrevWorldPos
	| EVertexFactoryFlags::SupportsPositionOnly
	| EVertexFactoryFlags::SupportsCachingMeshDrawCommands
	| EVertexFactoryFlags::SupportsPrimitiveIdStream
	| EVertexFactoryFlags::SupportsRayTracing
	| EVertexFactoryFlags::SupportsRayTracingDynamicGeometry
);

``` 

# FRHIResourceCreateInfo
现在要加上一个DebugName
```cpp
FRHIResourceCreateInfo(const TCHAR* InDebugName)
```   

# VertexFactory
感觉上因为要支持GPUScene，相比之前多了一些函数要实现  
在写顶点工厂的shader的时候，在最后面加上一行  
```cpp
//LocalVertexFactory.ush
#include "VertexFactoryDefaultInterface.ush"

//我在插件中写顶点工厂的时候是这样
#include "/Engine/Private/VertexFactoryDefaultInterface.ush"
```  
这样能够提供默认的函数，比如
`VertexFactoryGetViewIndex`和
`VertexFactoryGetInstanceIdLoadIndex`
```cpp
// Note: include at the end of vertex factories to provide default/dummy implementation of factory functions that are not supported OR that follow the standard pattern
// E.g., if the VF implements the three flavours of VertexFactoryGetViewIndex, it should define VF_IMPLEMENTED_GET_VIEW_INDEX
```
不过，如果使用了`VertexFactoryDefaultInterface.ush`提供的函数，那么就需要把`FSceneDataIntermediates`要塞到FVertexFactoryIntermediates里面  
```cpp
//新增的结构体，毕竟现在流行GPUScene
struct FSceneDataIntermediates
{
	uint PrimitiveId;
	uint InstanceId;
	uint ViewIndex;
	// Index from which we load the instance info, needed for the 
	uint InstanceIdLoadIndex;
	FInstanceSceneData InstanceData;
	FPrimitiveSceneData Primitive;
};

```  
我最后是自己实现`VertexFactoryGetViewIndex`及其他3个函数，不使用GPUScene了。   

## DECLARE_INLINE_TYPE_LAYOUT
```
Assertion failed: TypeDependencyIndex != INDEX_NONE || bStaticTypeMatchesDerived [File:D:\UE5\UnrealEngine-5.0\Engine\Source\Runtime\Core\Private\Serialization\MemoryImage.cpp] [Line: 1670] 
Unable to store pointer to derived type FXXPhysicsVertexFactoryShaderParametersVS, different from static type FVertexFactoryShaderParameters
Ensure UE_MEMORYIMAGE_TRACK_TYPE_DEPENDENCIES is set
Make sure derived type is not declared using DECLARE_INLINE_TYPE_LAYOUT()
```  

因为我实现FXXPhysicsVertexFactoryShaderParametersVS的时候用了`DECLARE_INLINE_TYPE_LAYOUT`

换成`DECLARE_TYPE_LAYOUT`并加上`IMPLEMENT_TYPE_LAYOUT`



另外注意到引擎中出现了CUDA的包装，感觉挺好的