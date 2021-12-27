以前写CUDA的时候用过CUDA提供的warp级别指令(warp应该对应AMD的wavefront)，当时没在hlsl里面找到对应的指令，以为不支持。最近在SM6中看到了相关指令，而且UE4也有使用，打算试一试。  

# NiagaraComputeFreeIDs.usf
要说最有可能用到warp指令的地方，就是粒子了。按常理来想，要在GPU维护一个长度变化的数组来支持粒子的消失，就需要Reduction操作，通常是求前缀和来得到索引值。   

```cpp
Buffer<int> IDToIndexTable;

// Output list of free IDs.
RWBuffer<int> RWFreeIDList;

// Buffer containing the current size of each list that's currently being processed.
// Multiple invocations of this shader might be running concurrently, for independent emitters.
RWBuffer<int> RWFreeIDListSizes;
// Index of the free list that's being computed by this invocation. The current size of the
// list is at RWFreeIDListSizes[FreeIDListIndex].
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
	uint NumGroupFreeIDs = WaveActiveCountBits(IsFree);

	// Compute a prefix sum on the predicate bit mask. This gives us the
	// local write offset for each lane.
	uint WriteOffset = WavePrefixCountBits(IsFree);

	// Skip the whole wave if all the IDs are in use.
	if(NumGroupFreeIDs > 0)
	{
		uint GroupWriteStart;
		if(WaveIsFirstLane())
		{
			// Add to the global write offset. The previous offset is where we start writing in the output buffer.
			// We can reduce the number of atomic adds by processing multiple sub-groups in the shader, such that each lane
			// computes the offsets and counts of a sub-group. However, this doesn't seem to be the bottleneck right now,
			// so it's not worth the effort.
			InterlockedAdd(RWFreeIDListSizes[FreeIDListIndex], NumGroupFreeIDs, GroupWriteStart);
		}

		// Broadcast the global write offset to all lanes.
		// TODO: WaveReadFirstLane is actually called WaveReadLaneFirst in HLSL, despite what the docs say, so we need to change our defines for
		// other platforms to use the HLSL name or we'll run into trouble when we'll compile for SM6.
		GroupWriteStart = WaveReadFirstLane(GroupWriteStart);

		if(IsFree)
		{
			RWFreeIDList[GroupWriteStart + WriteOffset] = ParticleID;
		}
	}
}
```