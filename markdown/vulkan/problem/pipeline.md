# 关于管线
## 文件cache
UE4的PSO缓存，缓存的是管线的详细信息，存放成csv。和`vkPipelineCache`不是一个东西
## PipelineCache
乍一看以为可以通过`vkPipelineCache`构建管线，实则不是  
```
Pipeline cache objects allow the result of pipeline construction to be reused between pipelines and between runs of an application. Reuse between pipelines is achieved by passing the same pipeline cache object when creating multiple related pipelines. Reuse across runs of an application is achieved by retrieving pipeline cache contents in one run of an application, saving the contents, and using them to preinitialize a pipeline cache on a subsequent run. The contents of the pipeline cache objects are managed by the implementation. Applications can manage the host memory consumed by a pipeline cache object and control the amount of data retrieved from a pipeline cache object.
```
```
Once created, a pipeline cache can be passed to the vkCreateGraphicsPipelines vkCreateRayTracingPipelinesKHR, vkCreateRayTracingPipelinesNV, and vkCreateComputePipelines commands. If the pipeline cache passed into these commands is not VK_NULL_HANDLE, the implementation will query it for possible reuse opportunities and update it with new content. The use of the pipeline cache object in these commands is internally synchronized, and the same pipeline cache object can be used in multiple threads simultaneously.
```  
`vkPipelineCache`看起来无法显式的应用，只能按照规则传给api，不去管其原理，期待可能会出现的加速作用
## vkCreateGraphicsPipeline
使用`vkCreateGraphicsPipeline`创建的管线，是否有平台差异，是否包含shader的全部信息
