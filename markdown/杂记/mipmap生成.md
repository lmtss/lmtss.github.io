做FFT生成到RT后，对图形api提供的generate mipmap 功能十分困惑  
# 当前api提供的接口的实现原理是啥
## OpenGL
`glGenerateMipmap` 是gl的接口，但是gl并不要求具体的实现方式  
[stackOverflow](https://stackoverflow.com/questions/23017317/mipmap-generation-in-opengl-is-it-hardware-accelerated)  