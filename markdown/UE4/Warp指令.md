以前写CUDA的时候用过CUDA提供的warp级别指令(warp应该对应AMD的wavefront)，当时没在hlsl里面找到对应的指令，以为不支持。最近在SM6中看到了相关指令，而且UE4也有使用。  

# NiagaraComputeFreeIDs.usf
要说最有可能用到warp指令的地方，就是粒子了。按常理来想，要在GPU维护一个长度变化的数组来支持粒子的消失/诞生，就需要Reduction操作，通常是求前缀和来得到索引值。   
在不使用warp指令的情况下，求前缀和通常用共享内存(shared memory)来实现，比如通过$log_2N$次循环来向共享内存中读写来加和。详情可以看[GPU GEMS 3](https://developer.nvidia.com/gpugems/gpugems3/part-vi-gpu-computing/chapter-39-parallel-prefix-sum-scan-cuda)  
不过有了warp指令就简单得多了。   

* `WavePrefixCountBits(bool bBit)` 假设当前线程在warp内的序号为7，那么这个函数能够返回0~6线程中bBit为true的线程的数量。[文档](https://docs.microsoft.com/en-us/windows/win32/direct3dhlsl/waveprefixcountbytes)。有了这个函数，我们在进行stream compact的时候，就能判断当前线程的输出应该写入到哪个位置(相对于整个warp的起始位置)。  
* `WaveIsFirstLane` 判断当前线程是不是warp内的第一个。有些操作中，一个warp有且仅需要进行一次(写入一次)，通常往往就让第一个线程来实施。不用warp指令的话就是用线程组的第一个线程。
* `WaveActiveCountBits(bool bBit)` 获取当前warp内所有bBit为true的线程的数量。这个函数可以用来计算当前warp的输出位置。这个的结果加上WavePrefixCountBits的结果就是全局的位置。
* `WaveReadFirstLane(type e)` 获取第一个线程对应的变量值。

```cpp
//输出空闲的粒子ID


Buffer<int> IDToIndexTable;

// Output list of free IDs.
RWBuffer<int> RWFreeIDList;

// Buffer containing the current size of each list that's currently being processed.
// Multiple invocations of this shader might be running concurrently, for independent emitters.
RWBuffer<int> RWFreeIDListSizes;
// Index of the free list that's being computed by this invocation. The current size of the
// list is at RWFreeIDListSizes[FreeIDListIndex].
//这次计算的List对应的ID
uint FreeIDListIndex;

// Note: The C++ is responsible for ensuring THREAD_COUNT is the size of a wave

[numthreads(THREAD_COUNT, 1, 1)]
void ComputeFreeIDs(uint3 GroupId : SV_GroupID, uint3 GroupThreadId : SV_GroupThreadID, uint3 DispatchThreadId : SV_DispatchThreadID)
{
	uint InputStart = GroupId.x * THREAD_COUNT;
	uint Thread = GroupThreadId.x;

	uint ParticleID = InputStart + Thread;
	uint IsFree = (IDToIndexTable[ParticleID] == -1) ? 1 : 0;
	
	// Count how many predicates are true across all lanes.
	// 整个warp有多少个空闲的粒子
	uint NumGroupFreeIDs = WaveActiveCountBits(IsFree);

	// Compute a prefix sum on the predicate bit mask. This gives us the
	// local write offset for each lane.
	// 在这个前程之前的线程中有多少个空闲的粒子
	uint WriteOffset = WavePrefixCountBits(IsFree);

	// Skip the whole wave if all the IDs are in use.
	//如果整个warp的粒子都不空闲就跳过
	if(NumGroupFreeIDs > 0)
	{
		uint GroupWriteStart;	//warp的起始位置
		if(WaveIsFirstLane())
		{
			// Add to the global write offset. The previous offset is where we start writing in the output buffer.
			// We can reduce the number of atomic adds by processing multiple sub-groups in the shader, such that each lane
			// computes the offsets and counts of a sub-group. However, this doesn't seem to be the bottleneck right now,
			// so it's not worth the effort.

			// 原子操作 加法，并返回原来的值
			// void InterlockedAdd(in  R dest,in  T value,out T original_value);
			InterlockedAdd(RWFreeIDListSizes[FreeIDListIndex], NumGroupFreeIDs, GroupWriteStart);
		}

		// Broadcast the global write offset to all lanes.
		// TODO: WaveReadFirstLane is actually called WaveReadLaneFirst in HLSL, despite what the docs say, so we need to change our defines for
		// other platforms to use the HLSL name or we'll run into trouble when we'll compile for SM6.
		//第一个线程的GroupWriteStart变量通过InterlockedAdd得到了warp的起始位置
		GroupWriteStart = WaveReadFirstLane(GroupWriteStart);

		if(IsFree)
		{
			//GroupWriteStart + WriteOffset就是全局的输出位置
			RWFreeIDList[GroupWriteStart + WriteOffset] = ParticleID;
		}
	}
}
```  

可以说是比使用Shared Memory的方案方便得多，过去在CUDA上测试的时候性能上也是更优(不排除是我写的不行的缘故)    
