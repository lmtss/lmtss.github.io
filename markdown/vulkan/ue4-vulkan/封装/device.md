# 关于队列的数量
```cpp
FVulkanQueue* GfxQueue;
inline FVulkanQueue* GetGraphicsQueue()
{
    return GfxQueue;
}
```  
在封装的`vulkanDevice`类中，各种队列似乎都只有一个，从api来看，vulkan对于某一类队列是有多个的。