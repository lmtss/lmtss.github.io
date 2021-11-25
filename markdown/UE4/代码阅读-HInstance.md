痛苦  
版本4.24  
发现剔除的不干净，有大量的草实例在屏幕外，看起来是按照簇剔除的时候，单个簇内的草太多导致的
## Traverse
使用元素为簇的树来管理实例，遍历树的函数就是`FHierarchicalStaticMeshSceneProxy::Traverse`   
每个`ClusterNode`都有自己的boundbox，都要进行视锥剔除，如果不被剔除且是叶子节点，那就把节点里面的实例加入待渲染的集合  
带渲染的集合是这样被描述的  
`(FirstInstance0, LastInstance0), (FirstInstance1, LastInstance1), (FirstInstance2, LastInstance2)`  
按照这里的代码来看，如果平均`ClusterNode`内的实例较少，也就是说拆分的较细，会导致drawcall增多  
但这里的一个问题是，即使drawcall增多，管线状态也应该是不变的吧  
  
可是在编辑器中用renderdoc，会发现两个绘制指令(DrawIndexedInstanced)之间调用了`IASetVertexBuffers`以及`UpdateSubresource`  
在手机上也是会有绑定资源的指令  
![](/img/UE4-DrawInstanced-es.png)  
查看这些指令的参数会发现，基本都是在改变buffer的offset    
ue4在调用`DrawIndexedInstanced`或`glDrawElementsInstanced`的时候，并没有使用`StartInstanceLocation`参数来描述实例的id，每一次绘制中，这个参数都是0  
也就是说他改变的是buffer中的offset，而不是在绘制指令中改变start  
在`OpenGLCommands`中有写，`FirstInstance is currently unsupported on this RHI`  
查找资料发现，需要用`glDrawElementsInstancedBaseInstance`才能指定初始实例的ID，  
相应的，在SM5中，也不是使用类似`BaseInstance`的参数来指定渲染的实例，看起来像是在shader中显式地用InstanceID从structureedbuffer中读取数据  

这个东西对于性能是否有影响不太清楚，需要测试  
在demo中刷了9k的草，测试簇的数量不同，看起来帧率影响不大，簇小的时候cpu占用明显增大，按照晓龙profiler的结果，簇小的时候，每秒渲染的顶点数下降。结果基本符合预期。  
相关指令  
`foliage.MinVertsToSplitNode`  
`foliage.RebuildFoliageTrees`  
`foliage.ToggleVectorCull`这个没测出来剔除效果的改进   
