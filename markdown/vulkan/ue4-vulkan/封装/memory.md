# 4.24
`FDeviceMemoryManager::Alloc`是调用`vkAllocateMemory`分配一段`devicememory`的函数，在创建buffer的时候，会使用这里管理的内存进行子分配，会有很多buffer分配到同一段内存中，也就是自己维护一个heap  
`FDeviceMemoryManager::Alloc`会创建一个`FBufferAllocation`对象，在创建顶点缓冲时，使用的都是这一个`FBufferAllocation`的`vkBuffer`，但是offset不同  
顶点缓冲对应`FBufferSuballocation`(从FBufferAllocation分配的，`FResourceHeapManager::AllocateBuffer`)，顶点缓冲和索引缓冲都继承于`FVulkanResourceMultiBuffer`，`FVulkanResourceMultiBuffer`存储一个或多个`FBufferSuballocation`  
# FVulkanSurface
然而并不是`vkSurface`的封装  
是纹理/RT的封装  
和分配顶点buffer相似，创建时会调用`FResourceHeapManager`的`AllocateImageMemory`分配一段内存  
这里有一个宏`VULKAN_SUPPORTS_DEDICATED_ALLOCATION`,代表是否支持专用内存，如果支持就会改为调用`AllocateDedicatedImageMemory`，专用内存应该效率会高一些[Nvidia](https://developer.nvidia.com/what%E2%80%99s-your-vulkan-memory-type)  
在4.24.1版本中，buffer和image的分配使用的类不同，使用`FOldResourceAllocation`  
在最新版本中[VulkanMemory.cpp](https://github.com/EpicGames/UnrealEngine/blob/release/Engine/Source/Runtime/VulkanRHI/Private/VulkanMemory.cpp)，

# 4.26
内存管理部分改版,`FDeviceMemoryManager`部分没怎么变，`FResourceHeapManager`没了  
`FVulkanSubresourceAllocator`替代`FBufferAllocation`  
`FVulkanAllocation`替代`FBufferSuballocation`  
总的关系还是很像的

# 分配方式
总的来说，有两种分配方式  
## buffer
buffer会
## image