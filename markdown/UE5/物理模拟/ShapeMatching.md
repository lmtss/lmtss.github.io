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

[basics-gpu-voxelization](https://developer.nvidia.com/content/basics-gpu-voxelization)基于保守光栅化，看起来是surface的

[Fast Parallel Surface and Solid Voxelization on GPUs](http://research.michael-schwarz.com/publ/files/vox-siga10.pdf)表面和实体体素化

[GPU Mesh Voxelizer](https://bronsonzgeb.com/index.php/2021/05/22/gpu-mesh-voxelizer-part-1/)这个的思路是先体素化三角形，然后再填充内部    

[CUDA C mesh voxelizer](https://github.com/kctess5/voxelizer)  

# 体素化与惯性张量
考虑过是否可以只进行表面的体素化，来节省shape matching的消耗。显然的，这样会影响质量分布，进而影响惯性张量。但是有没有可能通过在内部增加少量大质量粒子的方式近似原本的惯性张量？   
## chaos是如何计算惯性张量的？


# Fast Parallel Surface and Solid Voxelization on GPUs 
## 4 实体体素化
实体体素化要求一个封闭的、不漏水的对象，并设置中心在该对象内部的所有体素（参见图 2 c）。 为了捕捉精细细节并处理模型的非实体部分（如薄板），可以随后执行表面体素化，通过按位或设置附加体素。   