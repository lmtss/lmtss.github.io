给mobile写的shader要适配到SM5上，有一些问题
* skylight
  * 天光的计算不在light pass里面，而是在之后的一个单独的pass
  * 发现写的不透明和半透明的材质在天光上表现不同，半透明更亮
    * 固定天光和可移动天光效果不同
    * 删去basepass的IBL部分，translucent仍亮一些
    * 删去IBL和球谐，translucent全黑
    * 半透更亮应该是因为球谐部分
    * 暂时将diffuseColorForIndirect改为basecolor，两者一致
* 阴影
  * 对比两种预览，发现mobile中在阴影下要亮
  * 哦，原来是改了引擎