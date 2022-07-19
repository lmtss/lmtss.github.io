参考 [【深入浅出 Nvidia FleX】(3) Shape Matching (上)](https://zhuanlan.zhihu.com/p/51380047)  

里面提到了Flex的[体素化](https://github.com/NVIDIAGameWorks/FleX)  

`NvFlexExtCreateRigidFromMesh`里面调用了`Voxelize`和`MakeSDF`之后再转为粒子，最后生成一个`NvFlexExtAsset`   

## Voxelize 函数
* 分配空间充当一个3D数组
* 构建AABB树
* 二重循环对AABB树发射光线，命中的话就将3D数组对应的位置填为true。填充的时候是一次性填充一段连续的体素



## AABB树
使用SAH构建   

## MakeSDF


# 体素化
体素化的算法分为表面的和实体的体素化   

[基于簇的剔除](https://advances.realtimerendering.com/s2017/2017_Sig_Improved_Culling_final.pdf) 提到用保守光栅化剔除灯光        

[basics-gpu-voxelization](https://developer.nvidia.com/content/basics-gpu-voxelization)基于保守光栅化，看起来是surface的。通过PS写入到3D纹理的UAV中，而非RenderTarget。  

[Don't be conservative with Conservative Rasterization](https://developer.nvidia.com/content/dont-be-conservative-conservative-rasterization)，讲了NV对保守光栅化的硬件支持  

[AMD-vega](https://www.techpowerup.com/review/amd-vega-microarchitecture-technical-overview/4.html)，提到了AMD也在硬件上支持保守光栅化，但是看起来只能在DX12上支持。  

[Fast Parallel Surface and Solid Voxelization on GPUs](http://research.michael-schwarz.com/publ/files/vox-siga10.pdf)表面和实体体素化

[GPU Mesh Voxelizer](https://bronsonzgeb.com/index.php/2021/05/22/gpu-mesh-voxelizer-part-1/)这个的思路是先体素化三角形，然后再填充内部，但是看起来效率很差，他是每一个GPU线程遍历所有三角形    

[CUDA C mesh voxelizer](https://github.com/kctess5/voxelizer)看起来是通过光线-三角形相交来做的    

# 体素化与惯性张量
考虑过是否可以只进行表面的体素化，来节省shape matching的消耗。显然的，这样会影响质量分布，进而影响惯性张量。但是有没有可能通过在内部增加少量大质量粒子的方式近似原本的惯性张量？   
## chaos是如何计算惯性张量的？


# Fast Parallel Surface and Solid Voxelization on GPUs 
## 4 实体体素化
实体体素化要求一个封闭的、不漏水的对象，并设置中心在该对象内部的所有体素（参见图 2 c）。 为了捕捉精细细节并处理模型的非实体部分（如薄板），可以随后执行表面体素化，通过按位或设置附加体素。   


# UE的发丝体素化
因为是发丝，所以用循环的方式遍历线段中可能占据的体素，因而不需要光栅化   

# UE的体积雾体素化
VS-GS-PS，RT是3D纹理   
GS可以指定渲染到哪一个Layer，比如TextureArray的某个元素、3D纹理的某个Slice，或者Cubemap的某个面。  
　　
代码中的宏`USING_VERTEX_SHADER_LAYER`是指一些api可以支持在顶点着色器中做到这一点，比如[AMD_vertex_shader_layer](https://registry.khronos.org/OpenGL/extensions/AMD/AMD_vertex_shader_layer.txt)，不过看起来UE这里是Metal的功能   
`VolumetricFogVoxelization.usf`  
```cpp
struct FVoxelizeVolumePrimitiveVSToGS
{
	FVertexFactoryInterpolantsVSToPS FactoryInterpolants;
	float2 VertexQuadCoordinate : ATTRIBUTE0;
};

struct FVoxelizeVolumePrimitiveGSToPS
{
	FVertexFactoryInterpolantsVSToPS FactoryInterpolants;
	float4 OutPosition : SV_POSITION;
	uint SliceIndex : SV_RenderTargetArrayIndex;
};
```  

不考虑`USING_VERTEX_SHADER_LAYER`的情况，这个shader的VS向GS输出顶点的视空间位置。   
GS的输入是三角形，输出是各个slice上的三角形。   
GS  
```cpp
// Clone the triangle to each slice
for (int SliceIndex = ClosestSliceIndex; SliceIndex <= FurthestSliceIndex; SliceIndex++)
{

    UNROLL
    for (uint VertexIndex = 0; VertexIndex < NUM_INPUT_VERTICES; VertexIndex++)
    {
            // Use vertex positions that bound this slice of the sphere in view space
            ViewSpaceVertices[VertexIndex] = ViewSpacePrimitiveVolumeOrigin.xy + PrimitiveCenterToVertex[VertexIndex] * SliceRadius;
    }

    UNROLL
    for (uint VertexIndex = 0; VertexIndex < NUM_INPUT_VERTICES; VertexIndex++)
    {
        FVoxelizeVolumePrimitiveGSToPS Output;

        Output.SliceIndex = SliceIndex;

        float3 ViewSpaceVertexPosition = float3(ViewSpaceVertices[VertexIndex], SliceDepth);
        Output.OutPosition = mul(float4(ViewSpaceVertexPosition, 1), VoxelizeVolumePass.ViewToVolumeClip);
        Output.FactoryInterpolants = Inputs[VertexIndex].FactoryInterpolants;

        OutStream.Append(Output);

    }

    OutStream.RestartStrip();
}
```  
每个slice都对应一个三角形   