接下来给Shader传参，此时，我想传递一个`StructuredBuffer`，然后用`VertexID`取值。这个Buffer可能来自于ComputeShader或其他动态的计算。  

```cpp
//类似的东西在源码里面搜一下就有了
class FMyVertexFactoryShaderParametersVS : public FVertexFactoryShaderParameters
{
	DECLARE_INLINE_TYPE_LAYOUT(FMyVertexFactoryShaderParametersVS, NonVirtual);
public:
	void Bind(const FShaderParameterMap& ParameterMap)
	{
        //绑定shader中的变量，就和我们直接用图形api的时候差不多
		MyBufferParameter.Bind(ParameterMap, TEXT("MyStructuredBuffer"));
	}

	void GetElementShaderBindings(
		const FSceneInterface* Scene,
		const FSceneView* View,
		const FMeshMaterialShader* Shader,
		const EVertexInputStreamType InputStreamType,
		ERHIFeatureLevel::Type FeatureLevel,
		const FVertexFactory* VertexFactory,
		const FMeshBatchElement& BatchElement,
		class FMeshDrawSingleShaderBindings& ShaderBindings,
		FVertexInputStreamArray& VertexStreams) const
	{
        //此处用什么方式传递这个buffer都行，传ShaderBindings.Add里面就行
		FMyUserData* UserData = (FMyUserData*)BatchElement.UserData;
		ShaderBindings.Add(MyBufferParameter, UserData->MyBuffer);
	}

	LAYOUT_FIELD(FShaderResourceParameter, MyBufferParameter);
};

IMPLEMENT_VERTEX_FACTORY_PARAMETER_TYPE(FMyVertexFactory, SF_Vertex, FMyVertexFactoryShaderParametersVS);
```

对应的，在ush文件中  
```cpp
//顶点输入，此时并没有用它来获取顶点位置等数据，所以得到SV_VertexID就好
struct FVertexFactoryInput
{
	uint VertexId : SV_VertexID;
};

struct MyVertex 
{
    float3 Position;
};

//StructuredBuffer，在上面cpp代码中绑定
StructuredBuffer<MyVertex> MyStructuredBuffer;

//这个函数就会在BasePassVertexShader中被调用，除此之外还要实现其他的函数
float4 VertexFactoryGetWorldPosition(FVertexFactoryInput Input, FVertexFactoryIntermediates Intermediates)
{
    //事实上从buffer获取数据这一步应该写在GetVertexFactoryIntermediates里面
    MyVertex Vertex = MyStructuredBuffer[VertexIndex];
    Position = Vertex.Position;

    //这里得到的是TranslatedWorld没错
	return TransformLocalToTranslatedWorld(Position);
}
```  

Buffer的创建  
```cpp
void FMyVertexFactory::InitVertexResource_RenderThread(FRHICommandListImmediate& RHICmdList)
{
    //......


	FRHIResourceCreateInfo CreateInfo;
	CreateInfo.ResourceArray = nullptr;

	StructuredVertexBuffer = RHICreateStructuredBuffer(sizeof(MyVertex), sizeof(MyVertex) * Length, BUF_UnorderedAccess | BUF_ShaderResource, CreateInfo);
	StructuredVertexUAV = RHICreateUnorderedAccessView(StructuredVertexBuffer, true, false);
	StructuredVertexSRV = RHICreateShaderResourceView(StructuredVertexBuffer);

    //设置顶点输入流的格式
    //我们此时没有使用VertexBuffer来获取数据，所以这么写就好了
	SetDeclaration(GEmptyVertexDeclaration.VertexDeclarationRHI);
}

void FMyVertexFactory::InitRHI()
{
	ENQUEUE_RENDER_COMMAND(FMyVertexFactoryInitRHI)
		(
			[this](FRHICommandListImmediate& RHICmdList) {
		InitVertexResource_RenderThread(RHICmdList);
	}
	);
}

//不要忘了
void FMyVertexFactory::ReleaseRHI()
{
	StructuredVertexUAV->Release();
	StructuredVertexBuffer->Release();
	StructuredVertexSRV->Release();
}
```  
总是会有bug的，所以最好测试一下，简单的话，写一个debug模式，用point测试  
```cpp
//GetDynamicMeshElements里面
FMeshBatch& Mesh = Collector.AllocateMesh();

//只是测试，就不画三角形了
Mesh.Type = PT_PointList;
Mesh.VertexFactory = &VertexFactory;
Mesh.LCI = nullptr;
Mesh.ReverseCulling = IsLocalToWorldDeterminantNegative();

//按需要写就好
Mesh.bUseForMaterial = true;
Mesh.MaterialRenderProxy = MaterialRenderProxy;

FMeshBatchElement& BatchElement = Mesh.Elements[0];

//此处就代表绘制5个点
BatchElement.NumPrimitives = 5;
BatchElement.IndexBuffer = nullptr;
BatchElement.PrimitiveUniformBuffer = VertexFactory.GetUniformBuffer();
BatchElement.BaseVertexIndex = 0;
BatchElement.FirstIndex = 0;
BatchElement.bIsInstanceRuns = false;
BatchElement.NumInstances = 1;
BatchElement.MinVertexIndex = 0;

//传Buffer，用其他方式传也行
FMyUserData* UserData = &Collector.AllocateOneFrameResource<FMyUserData>();
BatchElement.UserData = (void*)UserData;
UserData->MyBuffer = VertexFactory.StructuredVertexSRV;
```