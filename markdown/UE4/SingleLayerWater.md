# 大概结构
最终结果来自于散射和水下的SceneColor的加和，而散射又是方向光散射和环境光散射的加和

# Phase Function
`Phase Function`描述了体积对不同方向的散射强度，根据参数，可能所有方向都一致；也有可能是和光线入射方向一致的方向很强，其他方向很弱   

下面是UE中的代码
```cpp
float IsotropicPhase()
{
	return 1.0f / (4.0f * PI);
}

float DirLightPhaseValue = 0.0f; // Default when Total Internal Reflection happens.
{
#if SIMPLE_SINGLE_LAYER_WATER
    DirLightPhaseValue = IsotropicPhase();
#else
    float IorFrom = 1.0f; // assumes we come from air
    float IorTo   = DielectricF0ToIor(DielectricSpecularToF0(Specular)); // Wrong if metal is set to >1. But we still keep refraction on the water surface nonetheless.
    const float relativeIOR = IorFrom / IorTo;
    float3 UnderWaterRayDir = 0.0f;
    if (WaterRefract(MaterialParameters.CameraVector, MaterialParameters.WorldNormal, relativeIOR, UnderWaterRayDir))
    {
        DirLightPhaseValue = SchlickPhase(PhaseG, dot(-ResolvedView.DirectionalLightDirection.xyz, UnderWaterRayDir));
    }
#endif
}
```  
这里提到了两个相函数(phase function)
## Isotropic 各项同性
既然这个是常数$\frac{1}{4\pi}$，也就代表这各个方向的散射程度是相同的、均匀的。  
## Schlick
这个phase function是另一个函数henyey-greenstein的近似  
henyey-greenstein的公式是  
$$
p(\theta, g)=\frac{1-g^2}{4\pi (1+g^2-2g\cos \theta)^{1.5}}
$$
此处的g根据取值可以达到不同效果  
* g > 0 是forward，出射方向和入射方向较相近的话会更强
* g = 0 代表各项同性，公式也就成了$\frac{1}{4\pi}$
* g < 0 是backward

而对这种函数的近似就是Schlick，他的公式是
$$
p(\theta , k)=\frac{1-k^2}{4\pi (1+k\cos\theta)^2}, \ \ \ \ \ \ \ k\approx 1.55g-0.55g^3
$$  

在UE中，`phase function`得出的结果会和方向光相乘  
```cpp
//移动端中，SunIlluminance是ResolvedView.DirectionalLightColor.rgb * PI;	
//times PI because it is divided by PI on CPU (=luminance) and we want illuminance here. 
//
float3 SunScattLuminance = DirLightPhaseValue * SunIlluminance;
```