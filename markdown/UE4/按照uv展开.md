打算将mesh的顶点信息绘制到RT，然后结合材质的纹理来得到光照结果  
理论上应该不需要编写自己的顶点工厂，或者使用LocalVertexFactory


## 数据
```cpp
RenderData = Mesh->RenderData.Get();
LODModel = RenderData->LODResource[0];
//section指的是同一个StaticMesh中的不同部分，通常有着不同的材质
Section = LODModel.Sections[SectionIndex];
NumPrimitives = Section.NumTriangles;
FirstIndex = ...
NumVertices = Section.MaxVertexIndex - Section.MinVertexIndex + 1;
BaseVertexIndex = Section.MinVertexIndex;
//得到vertexbuffer(stream)
VertexFactory = RenderData->LODVertexFactories[0].VertexFactory;
VertexFactory.GetStreams(..,Default, VertexStreams);
//VertexDeclaration
Declaration = VertexFactory.GetDeclaration(Default);
//indexbuffer
IndexBuffer = &LODModel.IndexBuffer;
RHIIndexBuffer = IndexBuffer->IndexBufferRHI;

```
## 绘制
```cpp
//...RenderPass略
//...GraphicsPipelineState略
GraphicsPipelineStateInitializer.BoundShaderState.VertexDeclarationRHI = Declaration;
//设置vertex
RHICmdList.SetStreamSource(Stream.StreamIndex, Stream.VertexBuffer, Stream.Offset);
//Draw
RHICmdList.DrawIndexedPrimitive(
    RHIIndexBuffer,
    BaseVertexIndex,
    0,
    NumVertices,
    FirstIndex,
    NumPrimitives,
    1
);
```
## Shader
个人只需要Mesh法线信息，所以比较简单，一般的Mesh渲染抄`LocalVertexFactory`就好了  
```cpp
//参考LocalVertexFactory里面的代码增加需要的属性  
//顶点着色器的输入
struct FVertexFactoryInput
{
    float4 Position : ATTRIBUTE0;
    half3 TangentX  : ATTRIBUTE1;
    half4 TangentZ  : ATTRIBUTE2;
    half4 Color     : ATTRIBUTE3;
    float4 TexCoord : ATTRIBUTE4;
}
//顶点着色器的输出
struct VSOutput
{
    float4 Interpolant0 : TEXCOORD0;    //自己需要的内容
    float4 Position     : SV_POSITION;
}
void MainVS(
    FVertexFactoryInput Input,
    out VSOutput Output
)
{
    float2 UV = Input.TexCoord.xy;
    UV.y = 1.0 - uv.y;
    uv = uv * 2.0 - 1.0;    //为了和纹理对应
    Output.Position = float4(uv.x, uv.y, 0.0, 1.0); //按照uv展开

    half3x3 TangentToLocal = CalcTangentToLocal(Input, TangentSign);    //这个函数抄即可
    half3 Normal = TangentToLocal[2];
    Output.Interpolant0 = .....
}
```
## Mesh Section的序号和编辑器中材质插槽的序号不一致
`Section`中存储了`MaterialIndex`，因此遍历一下就能对应
## uv复用
简化到只判断垂直还是水平，不输出Nomral的z分量，而是，如果偏向垂直，则r加1，偏向水平，则g加1。最后判断这个像素是偏向垂直还是水平