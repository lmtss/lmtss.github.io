做FFT生成到RT后，对图形api提供的generate mipmap 功能十分困惑  
# 当前api提供的接口的实现原理是啥
简单来想就是类似pixel shader一级一级下采样，但是会在底层优化的很好  
不过看到了[AMD发的一篇](https://zhuanlan.zhihu.com/p/263387791)生成mipmap的文章，大概就是用cs在一个pass内生成所有level。如果说这个算法比目前的生成方式快的话，或许意味着当前api提供的方式都是一级一级的下采样？
## OpenGL
`glGenerateMipmap` 是gl的接口，但是gl并不要求具体的实现方式  
[stackOverflow](https://stackoverflow.com/questions/23017317/mipmap-generation-in-opengl-is-it-hardware-accelerated)  