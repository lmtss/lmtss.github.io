## reduce模式
曾有一段时间，读文章的时候总遇到reduce这个词，有不明白什么意思，后来才知道指的是什么。  
reduce可以认为类似于划分子问题，就像归并排序  
## 优化点
通用的，`share memory`、[bank conflict](https://lmtss.github.io/page.html?path=CUDA/bank%20conflict)、`展开循环`、[shfl替代share memory](https://lmtss.github.io/page.html?path=CUDA/warp级别指令)