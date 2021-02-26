# 采样器
```cpp
FSamplerStateRHIRef FVulkanDynamicRHI::RHICreateSamplerState(const FSamplerStateInitializerRHI& Initializer)
{
	VkSamplerCreateInfo SamplerInfo;
	FVulkanSamplerState::SetupSamplerCreateInfo(Initializer, *Device, SamplerInfo);

	uint32 CRC = FCrc::MemCrc32(&SamplerInfo, sizeof(SamplerInfo));

	{
		FScopeLock ScopeLock(&GSamplerHashLock);
		TMap<uint32, FSamplerStateRHIRef>& SamplerMap = Device->GetSamplerMap();
		FSamplerStateRHIRef* Found = SamplerMap.Find(CRC);
		if (Found)
		{
			return *Found;
		}

		FSamplerStateRHIRef New = new FVulkanSamplerState(SamplerInfo, *Device);
		SamplerMap.Add(CRC, New);
		return New;
	}
}
```  
维护一个map，存放各种采样器，使用`VkSamplerCreateInfo`作为索引来读取