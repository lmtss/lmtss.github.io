## AtomicExch 构建
链表方法，head是与均匀网格同大小的数组，比如8-8-8的网格，head的长度就是512；next长度与粒子数量一致。
```cpp
int last_particle_id = atomicExch(&head[grid_id], id);
next[id] = last_particle_id;
```  
原子操作是相当耗时的，应想办法减少原子操作。当同一个单元格内粒子很多时，会执行很多次原子操作，所以单元格数量越多(分格越多)，平均单元格内粒子越少，时间会越短。
## 排序
先算出每个粒子对应的cell ID，一般来说是
$$
id = [\frac{x - x_{origin}}{d}] + [\frac{y - y_{origin}}{d}] \times K + [\frac{z - z_{origin}}{d}] \times K \times L
$$
用cell ID当作键值排序，不过排序算法实现起来比较困难，也未必比原子操作的方式快。
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

## 经验
关于cell id。无论是创建网格还是查找邻域使用网格的时候，都需要当前粒子所在的cell的id。这个id在查邻阶段，可以计算出来，也可以在创建网格的时候就存起来，至于哪个快，就很微妙。  
我编写的测试中，用2097152个粒子测试，每个粒子一个线程，则表现为，使用存储起来的id更快，要快2ms。  
而用32768个粒子测试的时候，使用存储的id还是要快0.13ms左右。  
使用GTX 950m测试，对于我的使用场景来说，这两个测试事例比较足够。具体的话，应该是可以通过比较操作所需的clock cycle数得出结论的。  