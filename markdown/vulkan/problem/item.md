## viewport
创建图形管线的时候，可以缓存管线，但如果viewport改变，难道需要重新创建管线？  
[reddit](https://www.reddit.com/r/vulkan/comments/51ddog/question_about_handling_resize_events/)  
```cpp
//UE4 创建pipeline中的代码
DynamicStatesEnabled[DynamicState.dynamicStateCount++] = VK_DYNAMIC_STATE_VIEWPORT;
DynamicStatesEnabled[DynamicState.dynamicStateCount++] = VK_DYNAMIC_STATE_SCISSOR;
DynamicStatesEnabled[DynamicState.dynamicStateCount++] = VK_DYNAMIC_STATE_STENCIL_REFERENCE;
DynamicStatesEnabled[DynamicState.dynamicStateCount++] = VK_DYNAMIC_STATE_DEPTH_BOUNDS;
```   
`VK_DYNAMIC_STATE_`相关的枚举很多，不过UE4中只用到4个  
`vkCmdSetViewport`当管线设置了`VK_DYNAMIC_STATE_VIEWPORT`时，可以用该指令设置viewport  
```cpp
void FVulkanCommandListContext::RHIDrawPrimitive(uint32 BaseVertexIndex, uint32 NumPrimitives, uint32 NumInstances)
{
	FVulkanCmdBuffer* CmdBuffer = CommandBufferManager->GetActiveCmdBuffer();
	PendingGfxState->PrepareForDraw(CmdBuffer);
	NumInstances = FMath::Max(1U, NumInstances);
	uint32 NumVertices = GetVertexCountForPrimitiveCount(NumPrimitives, PendingGfxState->PrimitiveType);
	VulkanRHI::vkCmdDraw(CmdBuffer->GetHandle(), NumVertices, NumInstances, BaseVertexIndex, 0);
}
```  
在UE4中，draw之前会调用一次`PrepareForDraw`，其中就会调用`vkCmdSetViewport`   
# RenderPass
创建GraphicsPipeline的时候，也需要输入renderpass作为参数，那么是否意味着，输出到rgba8和输出到rgba16是两个不同的pipeline
# RenderPass Attachment samples
