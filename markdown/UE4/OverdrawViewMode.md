内容来自4.24  
从代码来看，有四种复杂度视图  
* shader complexity
* overdraw
* shader complexity with overdraw
* shader complexity with overdraw bleeding
不过编辑器上只显示三种，第四种并没有开启开关  
前三个对应的shader都是`ShaderComplexityAccumulatePixelShader`  
从表现上来看，第一个视图不会去绘制三角形的边缘，对应shader中的`bShowQuadOverdraw`  
bShowQuadOverdraw会决定是否使用一张纹理来进行同步[相关代码](https://github.com/EpicGames/UnrealEngine/blob/4.26.2-release/Engine/Shaders/Private/QuadOverdraw.ush)  
代码中使用了一个原子操作，`InterlockedCompareExchange`，比较a和b，如果相等，则交换a和c  

QuadOverdraw大概逻辑  
* 一开始为等待状态
* 等待状态
  * 判断当前quad的PrimitiveID
    * 如果是当前quad没被占用，则说明当前quad被线程拥有，装态转为Owner
    * 被占用了，且是同一个Primitive，则进入同步态，并将占用值++
    * 被占用了，不是同一个Primitive，继续等待(另一个Primitive在结束后会把占用清空)
* Owner
  * 不断获取占用值(当一个线程法线该quad被占用且是同一个Prim占用时，会++)
  * 所以Owner态的线程能够统计出Quad被多少个线程(像素)占用
* 同步态
  * 同步态不写入纹理，并不断获取别的线程写入的占用值

所以，如果一个quad，全被同一个prim占用，则是4
如果一个quad，被两个prim占用，那么可能是两个2，或者一个1一个3  
这个值越低，颜色越深