版本4.24.1
## VerifyGlobalShaders
确保所有的GlobalShader被编译  
会判断变体的数量，如果超过一定大小会报错，大概因为Tonemap的变体数量多
## RecompileShaders
对应命令行`RecompileShaders [flag]`  
重新编译shader，根据输入的命令来选择不同的模式  
* changed 编译变化的shader
* Global
* Material
* All
* [ShaderTypeByFileName] 将[flag]字符串当作usf文件的路径，来编译对应的shader