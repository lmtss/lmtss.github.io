## AtomicExch 构建
链表方法，head是与均匀网格同大小的数组，比如8-8-8的网格，head的长度就是512；next长度与粒子数量一致。
```cpp
int last_particle_id = atomicExch(&head[grid_id], id);
next[id] = last_particle_id;
```  
原子操作是相当耗时的，应想办法减少原子操作。
## 排序
## 排序 + z-order
## 链表法中的数据清空
每一step后都要清空均匀网格的值，实践表明，不应该每一个要清空的值都分配一个线程，一个线程清除多个值会比较好。在一些情况下，比如网格总数和粒子总数相同，可以让head和next在一个kernel函数中清除。使用128-128-128的均匀网格测试，时间平均减少1ms。  
如果head的长度和next的长度不同，在核函数中就需要使用if语句，不过据测试128-128-64的网格，两倍长度的粒子数，仍是快了0.5ms。  
测试使用GTX 950m。  
```cpp
__global__ void kernel_clear(int *head, int *next) {
	int id = blockIdx.x * blockDim.x + threadIdx.x;

	next[id] = -1;
	next[id + 128 * 128 * 32] = -1;
	next[id + 128 * 128 * 64] = -1;
	next[id + 128 * 128 * 96] = -1;

	head[id] = -1;
	head[id + 128 * 128 * 16] = -1;
	if (id < 128 * 128 * 32) {
		head[id + 128 * 128 * 32] = -1;
		head[id + 128 * 128 * 48] = -1;
	}
}
```