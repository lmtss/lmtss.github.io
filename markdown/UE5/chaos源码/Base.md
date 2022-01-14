# 惯性张量
通用的惯性张量是一个 3x3的矩阵，如果是球、长方体这样的对称物体，则是一个 3x3的对角矩阵  
而在chaos中，local空间的惯性张量是一个三维向量，描述对角线上的元素  
```cpp
/**
* @brief Get the local-space inverse inertia (diagonal elements)
*/
inline const FVec3LP& InvILocal() const { return State.InvILocal; }
```  
世界空间的惯性张量是一个 3x3矩阵，通过local的惯性张量乘方向矩阵得到  
$$
I^{-1}=RI^{-1}_0R^T
$$  
```cpp
/**
* Calculate the world-space inertia (or inverse inertia) for a body with center-of-mass rotation "CoMRotation" and local-space inertia/inverse-inertia "I".
*/
static FMatrix33 ComputeWorldSpaceInertia(const FRotation3& CoMRotation, const FMatrix33& I)
{
    FMatrix33 QM = CoMRotation.ToMatrix();
    return MultiplyAB(QM, MultiplyABt(I, QM));
}

static FMatrix33 ComputeWorldSpaceInertia(const FRotation3& CoMRotation, const FVec3& I)
{
    // @todo(ccaulfield): optimize ComputeWorldSpaceInertia
    return ComputeWorldSpaceInertia(CoMRotation, FMatrix33(I.X, I.Y, I.Z));
}
```