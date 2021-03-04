`FDeviceMemoryManager::Alloc`是调用`vkAllocateMemory`分配一段`devicememory`的函数，在创建buffer的时候，会使用这里管理的内存进行子分配，会有很多buffer分配到同一段内存中，也就是自己维护一个heap  
`FDeviceMemoryManager::Alloc`会创建一个`FBufferAllocation`对象，在创建顶点缓冲时，使用的都是这一个`FBufferAllocation`的`vkBuffer`，但是offset不同  
顶点缓冲对应一个`FBufferSuballocation`(从FBufferAllocation分配的)