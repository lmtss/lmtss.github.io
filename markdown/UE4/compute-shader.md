在PC上写倒是容易，在移动端正常运行是个问题       
# 如何看glsl代码
编译后的glsl，可以令控制台数个指令开启，然后在`\Saved\ShaderDebugInfo\`下面
# S0001: Image has to be qualified as 'readonly', 'writeonly' or both
可以在`GlslBackend.cpp`中看到是如何添加这两个前缀的，从hlslcc输出的ir中带有`image_write `和`image_read`属性，在`GlslBackend`中，如果有`wirte && !read`则会添加前缀`writeonly`  
可以推断`hlslcc`有问题？  
## 修改GlslBackend
写变量的时候，添加特殊的前缀，类似`GLSLWO_xxx`这样，然后在GlslBackend判断字符串。但是`var->name`似乎不是正确的，使用`strncmp`判断不正确。