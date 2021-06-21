## for-loop with feedback
需要注意，每次迭代的输入是上一次迭代的结果，而不是最初的输入
### 挤出
对一个cube，在选定挤出的面`group`时，若填写的是固定的值，如`2`，那么每次迭代的挤出面不会是cube中`2`代表的面，而是迭代后的结果中的`2`。
### group的表示
可以使用判断语句来选定，如`@active==1`
## attribute
属性分为几类，`points` `vertices` `primitives` `detail`，在`geometry spreadsheet`中分别显示  
## 生成任意数量的点
创建一个`cube`，并挤出n次
## 如何计算曲线的坐标
曲线接受`Points`输入，所以生成一个`geometry`，编辑属性即可  
`point`节点(attribute expression)接受一个几何体，然后赋值即可
## 设置uv
添加`uv texture`节点后，可以看到属性多了三列`uv 0,1,2`  
大概是为了通用于体积材质，uv是三维的  
`uv texture`节点可以选择是在Point上添加还是在vertices上添加