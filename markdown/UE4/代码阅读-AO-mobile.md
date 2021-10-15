`Engine/Shaders/Private/PostProcessAmbientOcclusionMobile.usf`  
移动端加入的GTAO，相当于使用上一帧的深度计算  
# HORIZONSEARCH_INTEGRAL_PIXEL_SHADER
GTAOHorizonSearchIntegralPS  
这个`Horizon`，一开始还以为是横向的意思，事实上指的是什么不清楚，大概是说，这个search是基于屏幕的，就像是水平于屏幕一样搜索。或许是相对于随着法线搜索来说的？  
## SearchForLargestAngleDual
给定了屏幕方向(2D)，进行ray-march,找到最大角度   
```
//大概
loop begin
    UV = BaseUV + offset                //步进
    SceneDepth = GetSceneDepth(UV)      //根据uv获得深度
    ViewSpacePos = ScreenToViewPos(UV, SceneDepth)  //获得视空间的位置
    Angle = CalcAngle(ViewSpacePos, ViewPos)    //获得这次的角度
    BaseAngle = Max(BaseAngle, Angle)   //取最大角度
loop end
```   
取最大角度时，并非直接用max，而是如下 
```cpp
BestAng.x = (Ang > BestAng.x) ? Ang : lerp(Ang, BestAng.x, Thickness);
```

## CalculateGTAO
