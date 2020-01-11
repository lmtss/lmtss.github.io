## AtomicExch 构建
链表方法，head是与均匀网格同大小的数组，比如8-8-8的网格，head的长度就是512；next长度与粒子数量一致。
```cpp
int last_particle_id = atomicExch(&head[grid_id], id);
next[id] = last_particle_id;
```  
原子操作是相当耗时的，应想办法减少原子操作。
## 排序
## 排序 + z-order
## 清空数据
每一step后都要清空均匀网格的值，实践表明，不应该每一个要清空的值都分配一个线程，一个线程清除多个值会比较好。在一些情况下，比如网格总数和粒子总数相同，可以让head和next在一个kernel函数中清除。使用128-128-128的均匀网格测试，时间平均减少1ms。