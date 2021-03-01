`VulkanRHI\VulkanRHI\Private\VulkanPipeline` 
简单的话，就是用创建pipeline的信息，计算一个hash来维护一个map  
不过UE4并非使用`vkGraphicsPipelineCreateInfo`来计算hash，而是实现了类似的结构体来计算。  
# FGfxPipelineEntry
`FGfxPipelineEntry`类，会计算`FGfxEntryKey`，而`FGfxEntryKey`是继承通用的`TDataKey`使用`FCrc::MemCrc32`  
```cpp
// Actual information required to recreate a pipeline when saving/loading from disk
struct FGfxPipelineEntry;
```  
# FGfxPSIKey
如其缩写，使用`PipelineStateInitializer`创建的key
```cpp
//Pipeline管理器维护的
TMap<FGfxPSIKey, FVulkanRHIGraphicsPipelineState*> InitializerToPipelineMap;
```  


看起来，运行时的key和读写磁盘时用的key是不同