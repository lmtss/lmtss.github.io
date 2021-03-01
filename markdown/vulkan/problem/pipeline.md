# 关于管线
## 文件cache
按照网上说法，似乎可以将创建好的管线存放在文件，这是指管线的initializer(即管线创建用的信息)，还是管线(VkPipeline)?  
从UE4代码里看，储存的是`vkCreateGraphicsPipeline`创建的`VkPipeline`
## vkCreateGraphicsPipeline
使用`vkCreateGraphicsPipeline`创建的管线，是否有平台差异，是否包含shader的全部信息
