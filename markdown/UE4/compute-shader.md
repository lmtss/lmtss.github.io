在PC上写倒是容易，在移动端正常运行是个问题       
# 如何看glsl代码
编译后的glsl，可以令控制台数个指令开启，然后在`\Saved\ShaderDebugInfo\`下面
# S0001: Image has to be qualified as 'readonly', 'writeonly' or both
可以在`GlslBackend.cpp`中看到是如何添加这两个前缀的，从hlslcc输出的ir中带有`image_write `和`image_read`属性，在`GlslBackend`中，如果有`wirte && !read`则会添加前缀`writeonly`  
可以推断`hlslcc`有问题？  
## 修改GlslBackend
写变量的时候，添加特殊的前缀，类似`GLSLWO_xxx`这样，然后在GlslBackend判断字符串。但是`var->name`似乎不是正确的，使用`strncmp`判断不正确。
# OpenGLShader
这个cpp文件在编译ComputeShader上有问题，在4.24.1中有bug，会导致compute shader报错，需要删掉`LinkComputeShader`中VerifyCompiledShader  
不过，在新版本UE中已经改了
