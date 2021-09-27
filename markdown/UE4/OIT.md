使用移动端特性实现OIT，arm的PLS和metal的imageblocks都有相应的官方样例，原理不难
# 记录多层
## Render层
需要在SceneVisibility中遍历物体的时候，获取是否有使用了OIT的物体，来决定是否实行一个OIT-resolve的绘制
## 交叉编译-GL
高通使用fbf，而mali使用PLS，在usf层面上需要统一两者。好在UE4实现的移动端延迟渲染就是这么做的，可以参考  
这里的一个问题是类型，常见的做法需要在RT上存储多个深度值和多个颜色，通常是多个`16F`和多个`RGB`，这样会限制其他渲染的RT格式
## 交叉编译-Metal
不想做  
# Weighted-Blended-OIT
看起来，RT只需要`RGBA16`和`R8`，总的来说更容易和游戏相符，分解成`R11G11B10`和`R16F`和`R8(也可能是来自rgba8的一个通道)`   
## learnopengl中的介绍
[learnopengl](https://learnopengl.com/Guest-Articles/2020/OIT/Weighted-Blended)  
该算法对透明表面之间的相互遮挡因子强加了一种启发式方法，该因子随距相机的距离而增加。  
在所有的半透明表面被渲染之后，会有一个全屏的组合pass来减少错误，毕竟和真正的结果相比，这个启发式方法是一个不够好的近似。  
该技术的主要限制是必须针对透明表面的预期深度范围和不透明度调整加权启发式。(需要调参)  
渲染物体的pass  
```cpp
float weight =
    max(min(1.0, max(max(color.r, color.g), color.b) * color.a), color.a) *
    clamp(0.03 / (1e-5 + pow(z / 200, 4.0)), 1e-2, 3e3);

// blend func: GL_ONE, GL_ONE
// switch to pre-multiplied alpha and weight
accum = vec4(color.rgb * color.a, color.a) * weight;

// blend func: GL_ZERO, GL_ONE_MINUS_SRC_ALPHA
reveal = color.a;
```  
全屏的组合pass
```cpp
vec4 accum = texelFetch(rt0, int2(gl_FragCoord.xy), 0);
float reveal = texelFetch(rt1, int2(gl_FragCoord.xy), 0).r;

// blend func: GL_ONE_MINUS_SRC_ALPHA, GL_SRC_ALPHA
color = vec4(accum.rgb / max(accum.a, 1e-5), reveal);
```  
从给出的代码来看，不透明物体的RT和半透明的RT是分开的，全屏组合pass是输出到不透明物体RT。即是说，绘制translucent物体时用的RT和不透明物体不是一个。但移动端中通常要把不透明和半透明物体在一个pass中绘制，不应该因为OIT就打破这个设计。  


## 2013
[paper](http://jcgt.org/published/0002/02/09/)  
