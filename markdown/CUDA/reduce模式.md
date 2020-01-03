## reduce模式
曾有一段时间，读文章的时候总遇到reduce这个词，有不明白什么意思，后来才知道指的是什么。  
reduce可以认为类似于划分子问题，就像归并排序。具体上，reduce指的是从树叶到树根层层累加的过程。如果将过程看作一颗倒置的树，那reduce就是从上到下。  
## 优化点
通用的，`share memory`、[bank conflict](https://lmtss.github.io/page.html?path=CUDA/bank%20conflict)、`展开循环`、[shfl替代share memory](https://lmtss.github.io/page.html?path=CUDA/warp级别指令)

### 参考
[7 前缀和模式](https://zhuanlan.zhihu.com/p/81345223)  
[CUDA Reduction 一步一步优化](https://www.cnblogs.com/biglucky/p/4279699.html)  
![](/img/reduce_hebing.webp "合并访存")
```cpp
//在一个warp内求和
template<int num_thread = 32, typename T>
__device__ inline void device_reduce_in_warp(T data, int thread_id_in_warp) {
	T ret = data;
	for (int stride = num_thread / 2; stride > 0; stride >>= 1) {
		data = __shfl__down_sync(0xFFFFFFFF, ret, stride,num_thread);
		if (stride > thread_id_in_warp) {
			ret += data;
		}
	}
	return ret;
}
```
最后第0线程得出的值就是warp内所有线程中变量data的和。