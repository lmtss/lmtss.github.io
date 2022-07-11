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
说到体素化，我想到这篇 [基于簇的剔除](https://advances.realtimerendering.com/s2017/2017_Sig_Improved_Culling_final.pdf)提到的光栅化方法     

[basics-gpu-voxelization](https://developer.nvidia.com/content/basics-gpu-voxelization)

体素是填满体积的，不能有中空，否则质量分布会有问题，但是有没有可能通过在内部增加少量大质量粒子的方式近似原本的