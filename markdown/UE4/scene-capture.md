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
把capture渲染结果放到UI上的话，半透明物体渲染结果和场景中可能天差地别  
简单地想，将rgba纹理画到UI上，和画物体是有区别的  
比如一个`additive`的物体渲染到RT之后，使用`translucent`或预乘模式画到UI上，其结果是一定不同的。但是当画到RT上的物体很多时，会同时存在多种混合方式，而将RT绘制到UI上时则只能选择一种  
## 补救措施
有一个材质在场景中有着较明显的边缘光(`dot(n,v)这种`)，边缘处十分明显高亮，但渲染到UI上之后，高亮变得不明显  
UI材质是`translucent`模式渲染