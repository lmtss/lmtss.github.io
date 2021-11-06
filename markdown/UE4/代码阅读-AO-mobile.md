`Engine/Shaders/Private/PostProcessAmbientOcclusionMobile.usf`  
移动端加入的GTAO，相当于使用上一帧的深度计算  
# HORIZONSEARCH_INTEGRAL_PIXEL_SHADER
GTAOHorizonSearchIntegralPS  
这个`Horizon`，一开始还以为是横向的意思，事实上指的应该是`HBAO`中的`Horizon`  
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
## GetNormal
获取视空间法线，从法线buffer中获取，或者利用深度重建  
重建的代码大概如下  
```cpp
	float DeviceZ = GetDeviceZFromAOInput(UV);
	float DeviceZLeft = GetDeviceZFromAOInput(UV - XOffset);
	float DeviceZTop = GetDeviceZFromAOInput(UV - YOffset);
	float DeviceZRight = GetDeviceZFromAOInput(UV + XOffset);
	float DeviceZBottom = GetDeviceZFromAOInput(UV + YOffset);

	float DeviceZDdx = TakeSmallerAbsDelta(DeviceZLeft, DeviceZ, DeviceZRight);
	float DeviceZDdy = TakeSmallerAbsDelta(DeviceZTop, DeviceZ, DeviceZBottom);

	float ZRight = ConvertFromDeviceZ(DeviceZ + DeviceZDdx);
	float ZDown = ConvertFromDeviceZ(DeviceZ + DeviceZDdy);

	float3 Right = ScreenToViewPos(UV + XOffset, ZRight) - ViewSpacePosMid;
	float3 Down = ScreenToViewPos(UV + YOffset, ZDown) - ViewSpacePosMid;

	ViewSpaceNormal = normalize(cross(Right, Down));
```  
其中
```cpp
float TakeSmallerAbsDelta(float left, float mid, float right)
{
	float a = mid - left;
	float b = right - mid;

	return (abs(a) < abs(b)) ? a : b;
}
```  
这个函数的作用是从左侧变化和右侧变化中选择绝对值较小的那个，用来增强重构法线的质量，相交采样3次来说效果更好  
[参考1-stackoverflow](https://stackoverflow.com/questions/37627254/how-to-reconstruct-normal-from-depth-without-artifacts-on-edge)  
[参考2](https://wickedengine.net/2019/09/22/improved-normal-reconstruction-from-depth/)    
[参考3](https://atyuwen.github.io/posts/normal-reconstruction/)
## CalculateGTAO
