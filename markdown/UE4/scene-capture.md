# 后处理
需要添加一个模式，渲染出`final color`以及`alpha`，目前的`scenecapture`只支持`scenecolor alpha`，选用`finalColor`时没有alpha  
## 代码位置
`MobileSceneCaptureRendering.cpp`  
## alpha
半透明的alpha再渲染一遍opacity就行，和scenecolor的一样  
不透明物体的alpha依靠深度，原本是依靠rgba的a记录scenedepth，但是这个a可能在后处理中收到影响，可能需要查一遍所有后处理算法  
那么用另一张z纹理就合适的多  
## emmmm
最后一步是关闭了rgb的write mask，然后用copy shader(`ScreenPixelShader.usf`)复制alpha  
那么就不在这个shader上进行修改了，新写一个  

还需要在`SceneRendering.cpp`中的创建sceneRenderer中指定是否是scenecolor  

在`Tonemapper`中，似乎alpha会输出`0`(可能是sceneColor.a)  
那么，要么在Tonemapper中改，要么在单独渲染透明的时候对应处理  
## lut
发现，结果和场景渲染出来的不一样。  
`combineLUTs`这个步骤的结果不同  
发现是RT的`gamma`设置问题，默认的设置会导致lut输出与非capture结果不同  
## copy
在`scenecolor`时，会有一步copy操作；而在finalColor时则不需要，会在最后一个后处理时画到RT上。  
是否有这一步是通过判断是否是`SCS_FinalColorLDR`控制的，那么也把新加的`SCS`模式加到这个判断里面。  
## 是否需要?
由于需求是`final color`，是否还需要对这一步扩展?  
在不支持HDR的机器里面，可能还是会运行这一步，会额外做一次copy  
拓展`GShaderSourceModeDefineName`  
# UI
半透明物体渲染到RT再渲染到UI上时，出现了渲染错误  
## 引擎相关代码
`SlateElementPixelShader.usf`  
## BUG
在移动端上，可能需要将画面颠倒，在UE4的实现里，是通过多加一步copy来实现的  
所以需要实现copy相关代码，不然可能报错
## 一个例子
有一个材质在场景中有着较明显的边缘光(`dot(n,v)这种`)，边缘处十分明显高亮，但渲染到UI上之后，高亮变得不明显  
UI材质是`translucent`模式渲染  
当强制输出opacity为1时，边缘高光表现正常，但显然不能这么做。  
那么按照`color * a + sceneColor * (1 - a)`的公式逆推，是否让`color`提前除以`a`即可?  
结果看起来是不正确的  
将UI材质换成`additive`，结果变得正确了，然而背景一直是纯黑的，按理来说两者应该是一样的才对  
查看usf文件，发现在使用`additive`时，输出是`float4(color * alpha, 0.0)`  
于是尝试材质编辑器中rgb输出100，选用`translucent`，发现结果等于`1.0 * opacity`  
呃，很显然是数值超过了1，被截断了，竟是如此简单  
原来在使用`translucent`的时候，为了还原，材质中除以了`alpha`，这样在alpha混合后，预期会变成`color + (1 - a) * sceneColor`的效果，但是却因为除以`a`之后超过了1导致截断，最后颜色就变成了`a + (1 - a) * sceneColor`，尤其当a很小时，这个问题就尤为严重，特效会消失不见  
最后改成`Premultiplied Alpha`
# 不修改引擎
虽然可以在scenecapture上加后处理，但需要改引擎  
另一个方式是在UI材质上局部做一个tonemapper  
## 简易方法
UE4的shader文件中有一个简易tonemapper函数(注释)，ACES的拟合曲线，其配置的曲线参数顺便也把gamma做了
## gamma校正
查看UI材质的shader，会发现他做了校正  
从渲染流程上看，UI绘制在Tonemap之后，于是在绘制的时候，做一个local的矫正  
但是，如果UI需要绘制一个已经经过了Tonemap的RT，那么就不应该用这个矫正
`Engine/Shaders/Private/SlateElementPixelShader.usf`  
`Engine/Shaders/Private/GammaCorrectionCommon.ush`  
`ApplyGammaCorrection`  
```cpp
/**
 * @param GammaCurveRatio The curve ratio compared to a 2.2 standard gamma, e.g. 2.2 / DisplayGamma.  So normally the value is 1.
 */
half3 ApplyGammaCorrection(half3 LinearColor, half GammaCurveRatio)
{
	// Apply "gamma" curve adjustment.
	half3 CorrectedColor = pow(LinearColor, GammaCurveRatio);

	#if MAC
		// Note, MacOSX native output is raw gamma 2.2 not sRGB!
		CorrectedColor = pow(CorrectedColor, 1.0/2.2);
	#else
		#if USE_709
			// Didn't profile yet if the branching version would be faster (different linear segment).
			CorrectedColor = LinearTo709Branchless(CorrectedColor);
		#else
			CorrectedColor = LinearToSrgb(CorrectedColor);
		#endif
	#endif

	return CorrectedColor;
}    
```

不过在搞定相关问题后，还是有bug，发现是后处理调色lut导致(0,0,0)变成了非零的值
## 采样
后处理时，应该相近于`point sample`，处理后在UI上线性过滤  
而在UI材质中处理，则是线性过滤后进行处理    
从这一点来看，当UI中图的尺寸与RT不同时，高光处容易错误，尤其是边缘、尖端处  
当我用1024尺寸RT测试时，将其画在250尺寸的UI上，发现一些暗处被亮处'污染'了，而将其画在1024的UI上，这种现象会消失  
那这个问题或许可以抽象为  
$$
abs(\frac{f(a)+f(b)}{2}-f(\frac{a+b}{2}))
$$  
$$
\frac{x*(2.51*x+0.03)}{x*(2.43*x+0.59)+0.14}
$$  
