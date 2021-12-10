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
  * 不透明物体接收的阴影和不透明接受的阴影十分不同，大概只有在不过滤阴影的情况下才能一致。因此移动端中头发的做法就是问题，移动端forward中不透明和半透明的阴影都是直接采样shadowmap，过滤就pcf。因此在移动端中两者的阴影是一致的。