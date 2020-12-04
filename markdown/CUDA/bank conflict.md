bank conflict 即不同thread访问同一个bank产生的冲突，会使访问速度变慢  
虽然是经典问题，但是还是写下来吧  

## bank
share memory分为16个bank，大概长这样   

| Bank      | 0          |1          |2          |.....|
| --------- | -----------|-----------|-----------|-----|
| address   | 0 1 2 3    |4 5 6 7    |8 9 10 11  |.....|
| address   | 64 65 66 67|68 69 70 71|72 73 74 75|.....|
|address    |.....|.....|.....|.....|   

如果`thread 0`和`thread 1`同时访问第0个bank就会发生bank conflict，比如 `val = s_mem[base + 16 * tid]`
## 多少个bank？
bank的数量是根据硬件定死的还是可以软件定义
## 多个warp是否是同时
## 如果blocksize大于warp数？