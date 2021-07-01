做FFT生成到RT后，对图形api提供的generate mipmap 功能十分困惑  
# 当前api提供的接口的实现原理是啥
简单来想就是类似pixel shader一级一级下采样，但是会在底层优化的很好  
不过看到了[AMD发的一篇](https://zhuanlan.zhihu.com/p/263387791)生成mipmap的文章，大概就是用cs在一个pass内生成所有level。如果说这个算法比目前的生成方式快的话，或许意味着当前api提供的方式都是一级一级的下采样？
## OpenGL
`glGenerateMipmap` 是gl的接口，但是gl并不要求具体的实现方式  
[stackOverflow](https://stackoverflow.com/questions/23017317/mipmap-generation-in-opengl-is-it-hardware-accelerated)  
# 偶然看到的
[single pass mipmap](https://zhuanlan.zhihu.com/p/263387791)  
声称只有最后很短的一部分时间中，工作线程少  
问题是如何进行全局的同步，而不只是group内部的同步

# Generate Mipmaps unsupported on this OpenGL version
不只是显式调用会出发generate mipmaps，也要注意RT是否勾选了自动生成mipmaps