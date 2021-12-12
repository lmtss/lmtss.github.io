目的是要在插件中写一个primitive component，要包括自定义的vertex shader，通常来说意味着新的vertex factory  
# Build.cs
用到的依赖需要写在这里  
# 自定义的shader路径
新建一个路径，存放插件的shader
# 创建组件
不清楚如何直接用cpp创建，个人选择在编辑器中上方 `文件`按钮下，`新建c++类`，选择`Actor组件`，之后相关文件就自动创建好了。  
虽然个人想要的是一个直接继承`UPrimitiveComponent`的模板，但无大碍，直接改掉就好  