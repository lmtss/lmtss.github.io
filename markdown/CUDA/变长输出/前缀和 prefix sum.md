GPU上求前缀和算是求变长输出的一个前置技能吧，求完前缀和，就可以根据结果让输出结果找到位置  
网上资料很多，比如[GPU Gem 3](https://developer.nvidia.com/gpugems/gpugems3/part-vi-gpu-computing/chapter-39-parallel-prefix-sum-scan-cuda)，不过不写一遍还是不熟悉  

## 思路
求前缀和是一个[reduce模式](/page.html?path=CUDA/reduce模式)的问题，相关的优化可以参考的。  
同时CUDA提供了相关的库。 

## 先reduce再逆reduce
