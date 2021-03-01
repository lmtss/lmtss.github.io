```cpp
//VulkanRenderTarget
if (CurrDesc.samples > VK_SAMPLE_COUNT_1_BIT && FVulkanPlatform::RequiresRenderPassResolveAttachments())
{
    Desc[NumAttachmentDescriptions + 1] = Desc[NumAttachmentDescriptions];
    Desc[NumAttachmentDescriptions + 1].samples = VK_SAMPLE_COUNT_1_BIT;
    Desc[NumAttachmentDescriptions + 1].storeOp = VK_ATTACHMENT_STORE_OP_STORE;
    ResolveReferences[NumColorAttachments].attachment = NumAttachmentDescriptions + 1;
    ResolveReferences[NumColorAttachments].layout = VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL;
    ++NumAttachmentDescriptions;
    bHasResolveAttachments = true;
}
```  
其中`FVulkanPlatform::RequiresRenderPassResolveAttachments()`在UE4中，安卓以及windows小于等于ES3.1的平台会返回`true`