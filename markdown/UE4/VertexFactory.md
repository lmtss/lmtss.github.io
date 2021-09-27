4.24.1  
主要看的如何在插件中自定义meshcomponent以及相应的vertex shader(vertex factory)  
# NiagaraSceneProxy
`GetDynamicMeshElement`  
继承`FPrimitiveSceneProxy`需要实现的函数之一，用来解析场景中物体，构造成`FMeshBatch`，并将其塞到`FMeshElementCollector`中。  
在Niagara中，封装了一个NiagaraRenderer类，由这个类来处理SceneProxy的部分功能。比如GetDynamicMeshElement函数基本上是在各个NiagaraRenderer中实现的    
一个问题是，这个函数是何时被调用？是一帧调用一次还是当发生变化时被调用？  
看起来是每帧调用（至少动态物体的情况）。这样，就可以动态地调整`FMeshBatch`的属性
## DrawIndexedPrimitives ?  
另一个问题是，如何让他选择基于索引缓冲的绘制，还是无索引缓冲的绘制？  
4.24.1中，代码在`MeshPassProcessor.cpp`中，`SubmitDraw`方法，会按照是否有IndexBuffer来选择
# NiagaraMeshVertexFactory
在`.ush`文件中，可以编写插值、计算worldposition、定义vertexinput的代码，如果不去改引擎的话，应该是无法自定义整个vertex shader的。  
在`Common.ush`中，有对vertexID的定义  
## TranslatedWorldPosition
一个需要注意的地方是，  
```cpp
Output.Position = mul(RasterizedWorldPosition, TranslatedWorldToClip)
```  
这个地方的代码并不是在VertexFactory中写的，所以没法改，因此需要将RasterizedWorldPosition计算成TranslatedWorld空间的值
## 曲面细分
需要处理曲面细分时的代码，虽然实际上新添加的shader用不到曲面细分，但是不写的话会有编译错误
## xxx未完全初始化
shader中，一些输出的结构体若有一些成员没有被赋值，可能会报错。  
如果懒得找是那些成员的问题，可以写成   
```cpp
FVertexFactoryInterpolantsVSToPS Interpolants = (FVertexFactoryInterpolantsVSToPS)0;
```  
如此达到初始化的目的
## cpp
用到了一个宏`IMPLEMENT_VERTEX_FACTORY_TYPE`，这个宏在`VertexFactory.h`中定义  
一个问题是材质的编译，如何才能只编译需要的材质？一般来说是在材质上添加flag来判断是否编译为新添加的vertexfactory，但是如果在FMaterial上添加bool来做的话，就违背了`不修改引擎`的初衷。一个简单的方法是通过名字来判断。可是`GetBaseMaterialPathName()`方法是protected的。public的是一个叫`GetFriendlyName()`的方法，经测试可以正常使用。(测试是否编译材质的时候，记得把材质赋给物体，不然可能不编译)  
## VertexFactory::InitRHI
从代码来看，这里用来初始化VertexDeclaration，通过计算网格中的数据并调用`PipelineStateCache::GetOrCreateVertexDeclaration`来创建。  
如果想要一个空的VertexDeclaration呢？`PipelineStateCache::GetOrCreateVertexDeclaration`会按照传入的`FVertexDeclarationElementList`的内容来计算hash值，所以传入一个空的List恐怕会异常吧  
考虑到空的VertexDeclaration的内容应该是独一无二的，所以创建一个全局的就可以  
引擎中就存在一些这样的全局的VertexDeclaration，比如`GEmptyVertexDeclaration`，像是一些后处理，就是在VS中用VertexID计算的位置。包含在`CommonRenderResources.h`中  
## uniformbuffer
如果不需要uniformbuffer该怎么做？  
没有给`FMeshBatchElement`传入uniformbuffer的情况下，会在`PreparePrimitiveUniformBuffer`中报错  
kq
## Material not found FHitProxyVS
没想到报错了这个，而且还是在`WorldGridMaterial`报错，Log中输出的VertexFactory确实是自己新写的  
我在VertexFactory中限制了编译，只让特殊的材质编译，所以`WorldGridMaterial`这个材质找不到shader是正确的，因为我没让VertexFactory编译他，但我也没有把`WorldGridMaterial`赋给一个使用新增的VertexFactory的物体。大概因为WorldGridMaterial是某种默认材质？  
总之把WorldGridMaterial也加到编译中就好了
## VertexFactory在IsInitialized报错

## 如何限制编译
比如，我不想去让他编译到`VelocityShader`中，也不想编译到`Shadow`计算中，因为新增的这个VectorFactory不需要用上相关计算  
## 如何创建一个UPrimitiveComponent
在编辑器中创建c++类的时候，没有创建UPrimitiveComponent的选项。选择创建一个`ActorComponent`然后改为继承UPrimitiveComponent应该是可以的  
## 看不见
新写出来的component并不是一直是可视的，在编辑器中点击物体的话倒是会显示  
应该是被剔除了，需要写Component的`CalcBounds`方法