<head>
    <script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>
    <script type="text/x-mathjax-config">
        MathJax.Hub.Config({
            tex2jax: {
            skipTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
            inlineMath: [['$','$']],
            displayMath: [['$$','$$'], ['\\(', '\\)']]
            }
        });
    </script>
</head>  

`Engine/Shaders/Private/PostProcessAmbientOcclusionMobile.usf`  
移动端加入的GTAO，相当于使用上一帧的深度计算  
从代码中看，有SpatialFilter，没有时间上的累积(2021-11-24)   
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
但是在计算uv的offset的时候，有一个`UVOffset.y *= -1`，没搞懂为什么，需要测试
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
## GetRandomVector
用来得到随机的slice角度  
一开始以为是过去常用的魔法数字构建的噪声   
实际上用了InterleavedGradientNoise，交叉梯度噪声，学到了  
[使命召唤 http://www.iryoku.com/next-generation-post-processing-in-call-of-duty-advanced-warfare](http://www.iryoku.com/next-generation-post-processing-in-call-of-duty-advanced-warfare)  
[https://bartwronski.com/2016/10/30/dithering-part-three-real-world-2d-quantization-dithering/](https://bartwronski.com/2016/10/30/dithering-part-three-real-world-2d-quantization-dithering/)  
## ComputeInnerIntegral  
```cpp
half Gamma = acosFast_Half(CosAng) - PI_HALF;
	half CosGamma = dot(ProjNormal, ViewDir) * RecipMag;
	half SinGamma = CosAng * -2.0f;

	// clamp to normal hemisphere 
	Angles.x = Gamma + max(-Angles.x - Gamma, -(PI_HALF));
	Angles.y = Gamma + min(Angles.y - Gamma, (PI_HALF));

	half AO = ((LenProjNormal) *  0.25f *
		((Angles.x * SinGamma + CosGamma - cos((2.0 * Angles.x) - Gamma)) +
		(Angles.y * SinGamma + CosGamma - cos((2.0 * Angles.y) - Gamma))));
```
应该是对slice的积分，对应论文中如下公式  
$$
\hat{a}(\theta _1, \theta _2, \gamma)=\frac{1}{4}(-cos(2\theta _1-\gamma)+cos(\gamma)+2\theta _1sin(\gamma))\\
+\frac{1}{4}(-cos(2\theta _2-\gamma)+cos(\gamma)+2\theta _2sin(\gamma))
$$   
根据之前算出来的$\theta_1$和$\theta_2$计算切片的积分  
UE4也有用lut的方式来替代这里的计算  
同时还要计算一个权重  
```cpp
	// Given the angles found in the search plane we need to project the View Space GBuffer Normal onto the plane defined by the search axis and the View Direction and perform the inner integrate

	//Plane指的是切片对应的平面，这个normal就是这个平面的法线
	half3 PlaneNormal = normalize(cross(ScreenDir, ViewDir));
	half3 Perp = cross(ViewDir, PlaneNormal);

	//视空间法线在平面的投影
	half3 ProjNormal = ViewSpaceNormal - PlaneNormal * dot(ViewSpaceNormal, PlaneNormal);

	//这个长度就作为权重乘到slice的积分上
	half LenProjNormal = length(ProjNormal) + 0.000001f;
	half RecipMag = 1.0f / (LenProjNormal);

	half CosAng = dot(ProjNormal, Perp) * RecipMag;
```




## CalculateGTAO
* 1 调用`GetRandomVector`获取一个随机的方向
* 2 `SearchForLargestAngleDual`进行ray-march得到$\theta_1$和$\theta_2$
* 3 `ComputeInnerIntegral`计算slice的积分
* 4 循环2和3，加和

不过这里最后乘了一个$\frac{2}{\pi}$，应该是为了之后的SpatialFilter来使用的

    
## GTAOSpatialFilter
对应文中`4.3 Implementation detail`中提到的`Spatio-temporal sampling approach`中的空间上Filter
   
按照论文中的说法，应该是基于深度的双边滤波，不过叫成基于深度权重的滤波更合适吧，因为单纯纹理坐标对应的权重是均匀的，影响最终权重的唯一因素只是深度  
  
函数开头是获取当前像素周围的深度差  
```cpp
half2 Y2Offset = half2(0, 2 * BufferSizeAndInvSize.w);
half2 Y1Offset = half2(0, BufferSizeAndInvSize.w);

half YM2Z = GetDeviceZAndAO(TextureUV - Y2Offset).x;
half YM1Z = GetDeviceZAndAO(TextureUV - Y1Offset).x;
half YP1Z = GetDeviceZAndAO(TextureUV + Y1Offset).x;
half YP2Z = GetDeviceZAndAO(TextureUV + Y2Offset).x;

// Get extrapolated point either side
//获取外推点
half C1 = abs((YM1Z + (YM1Z - YM2Z)) - ThisZ);
half C2 = abs((YP1Z + (YP1Z - YP2Z)) - ThisZ);

//类似GetNormal，获取深度变化较小的那一边的深度差
if (C1 < C2)
{
	ZDiff.y = YM1Z - YM2Z;
}
else
{
	ZDiff.y = YP2Z - YP1Z;
}
```  
然后循环进行加权累加  
```cpp
half DepthBase = ThisZ - (ZDiff.x * 2) - (ZDiff.y * 2);

for (y = -2; y <= 2; y++)
{
	half PlaneZ = DepthBase;

	for (x = -2; x <= 2; x++)
	{
		// Get value and see how much it compares to the centre with the gradients
		half XDiff = abs(x);

		half2 CurrentTextureUV = TextureUV + half2(x, y) * BufferSizeAndInvSize.zw;
		half2 SampleZAndAO = GetDeviceZAndAO(CurrentTextureUV);

		half Weight = 1.0f;
		{
			// Get the bilateral weight. This is a function of the difference in height between the plane equation and the base depth
			// Compare the Z at this sample with the gradients 
			// 这里并不是用中心的深度和像素深度做差，而是用当前遍历的像素对应的平面的深度和原深度做差
			half SampleZDiff = abs(PlaneZ - SampleZAndAO.x);

			Weight = 1.0f - saturate(SampleZDiff*1000.0f);
		}

		SumAO += SampleZAndAO.y * Weight;
		SumWeight += Weight;

		PlaneZ += ZDiff.x;
	}
	DepthBase += ZDiff.y;
}
SumAO /= SumWeight;
```  
这里用5x5的像素构建了一个平面，用构建的这个平面上的深度来求权重，应该是要符合连续高度的假设吧。  
