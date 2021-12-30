本文剖析一下UE4的GPU基数排序  
以前发了[UE4阅读笔记-Niagara&Warp指令](https://zhuanlan.zhihu.com/p/450586745)，但是warp指令是只有SM6才能用的(如果是CUDA的话应该是不需要的)，所以还是要使用shared memory的方案来做     
基数排序的一大要点就是prefix sum，不用warp指令实现的方案知乎上已经有人介绍了  

 UpSweep
 ```cpp
 /*------------------------------------------------------------------------------
	The upsweep sorting kernel. This kernel performs an upsweep scan on all
	tiles allocated to this group and computes per-digit totals. These totals
	are output to the offsets buffer.
------------------------------------------------------------------------------*/

#if RADIX_SORT_UPSWEEP

/** Input keys to be sorted. */
Buffer<uint> InKeys;
/** Output buffer for offsets. */
RWBuffer<uint> OutOffsets;

/** Local storage for the digit counters. */
groupshared uint LocalCounters[BANKS_PER_DIGIT * DIGIT_COUNT * PADDED_BANK_SIZE];
/** Local storage for raking totals. */
groupshared uint LocalRakingTotals[RAKING_COUNTERS_PER_DIGIT * DIGIT_COUNT + 1];

/**
 * The upsweep sorting kernel computing a scan upsweep on tiles per thread group.
 */
[numthreads(THREAD_COUNT,1,1)]
void RadixSort_Upsweep(
	uint3 GroupThreadId : SV_GroupThreadID,
	uint3 GroupIdXYZ : SV_GroupID )
{
	uint i;
	uint FirstTileIndex;
	uint TileCountForGroup;
	uint ExtraKeysForGroup;

	// Determine group and thread IDs.
	const uint ThreadId = GroupThreadId.x;
	const uint GroupId = GroupIdXYZ.x;

	const uint BankOffset = ThreadId / (WORDS_PER_BANK);
	const uint CounterOffset = ThreadId & (WORDS_PER_BANK - 1);

	const uint BankToRakeOffset = GetBankToRakeOffset( ThreadId );		
	const uint RakingIndex = GetRakingIndex( ThreadId );

#if 0
	if ( RadixSortUB.ExtraKeyCount == 16 && RadixSortUB.TilesPerGroup != 0 )
	{
		if ( ThreadId == 0 )
		{
			OutOffsets[DIGIT_COUNT*1] = RadixSortUB.RadixShift;
			OutOffsets[DIGIT_COUNT*2] = RadixSortUB.TilesPerGroup;
			OutOffsets[DIGIT_COUNT*3] = RadixSortUB.ExtraTileCount;
			OutOffsets[DIGIT_COUNT*4] = RadixSortUB.ExtraKeyCount;
			OutOffsets[DIGIT_COUNT*5] = RadixSortUB.GroupCount;
		}
	}
#endif
		
	// Clear local counters.
	for ( uint DigitIndex = 0; DigitIndex < DIGIT_COUNT; ++DigitIndex )
	{
		const uint BankIndex = DigitIndex * BANKS_PER_DIGIT + BankOffset;
		LocalCounters[BankIndex * PADDED_BANK_SIZE + CounterOffset] = 0;
	}

	// Clear the raking counter padding.
	if ( ThreadId < RAKING_THREAD_COUNT )
	{
		[unroll]
		for ( i = 1; i <= RAKING_COUNTER_PADDING; ++i )
		{
			LocalRakingTotals[RakingIndex - i] = 0;
		}
	}

	// The number of tiles to process in this group.
	if ( GroupId < RadixSortUB.ExtraTileCount )
	{
		FirstTileIndex = GroupId * (RadixSortUB.TilesPerGroup + 1);
		TileCountForGroup = RadixSortUB.TilesPerGroup + 1;
	}
	else
	{
		FirstTileIndex = GroupId * RadixSortUB.TilesPerGroup + RadixSortUB.ExtraTileCount;
		TileCountForGroup = RadixSortUB.TilesPerGroup;
	}

	// The last group has to process any keys after the last tile.
	if ( GroupId == (RadixSortUB.GroupCount - 1) )
	{
		ExtraKeysForGroup = RadixSortUB.ExtraKeyCount;
	}
	else
	{
		ExtraKeysForGroup = 0;
	}

	// Key range for this group.
	uint GroupKeyBegin = FirstTileIndex * TILE_SIZE;
	uint GroupKeyEnd = GroupKeyBegin + TileCountForGroup * TILE_SIZE;

	// Acquire LocalCounters.
	GroupMemoryBarrierWithGroupSync();

	// Accumulate digit counters for the tiles assigned to this group.
	while ( GroupKeyBegin < GroupKeyEnd )
	{
		const uint Key = InKeys[GroupKeyBegin + ThreadId];
		const uint Digit = (Key >> RadixSortUB.RadixShift) & DIGIT_MASK;
		const uint BankIndex = Digit * BANKS_PER_DIGIT + BankOffset;
		LocalCounters[BankIndex * PADDED_BANK_SIZE + CounterOffset] += 1;
		//LocalCounters[BankOffset * PADDED_BANK_SIZE + CounterOffset] += 1;
		GroupKeyBegin += THREAD_COUNT;
	}

	// Accumulate digit counters for any additional keys assigned to this group.
	GroupKeyBegin = GroupKeyEnd;
	GroupKeyEnd += ExtraKeysForGroup;

	while ( GroupKeyBegin < GroupKeyEnd )
	{
		if ( GroupKeyBegin + ThreadId < GroupKeyEnd )
		{
			const uint Key = InKeys[GroupKeyBegin + ThreadId];
			const uint Digit = (Key >> RadixSortUB.RadixShift) & DIGIT_MASK;
			const uint BankIndex = Digit * BANKS_PER_DIGIT + BankOffset;
			LocalCounters[BankIndex * PADDED_BANK_SIZE + CounterOffset] += 1;
			//LocalCounters[BankOffset * PADDED_BANK_SIZE + CounterOffset] += 100;
		}
		GroupKeyBegin += THREAD_COUNT;
	}

	// Acquire LocalCounters.
	GroupMemoryBarrierWithGroupSync();

	// Reduce.
	uint Total = 0;
	if ( ThreadId < RAKING_THREAD_COUNT )
	{
		// Perform a serial reduction on this raking thread's counters.
		Total = LocalCounters[BankToRakeOffset];
		[unroll]
		for ( i = 1; i < COUNTERS_PER_RAKING_THREAD; ++i )
		{
			Total += LocalCounters[BankToRakeOffset + i];
		}

		// Place the total in the raking counter.
		LocalRakingTotals[RakingIndex] = Total;
	}

	for ( uint RakingOffset = 1; RakingOffset < RAKING_THREADS_PER_DIGIT; RakingOffset <<= 1 )
	{
		// Acquire LocalRakingTotals.
		PPS_BARRIER();
		Total += LocalRakingTotals[RakingIndex - RakingOffset];
		LocalRakingTotals[RakingIndex] = Total;
	}

	// Acquire LocalRakingTotals.
	GroupMemoryBarrierWithGroupSync();

	// Store digit totals for this group.
	if ( ThreadId < DIGIT_COUNT )
	{
		OutOffsets[GroupId * DIGIT_COUNT + ThreadId] = LocalRakingTotals[RAKING_COUNTERS_PER_DIGIT * (ThreadId+1) - 1];
	}
}

#endif // #if RADIX_SORT_UPSWEEP
```