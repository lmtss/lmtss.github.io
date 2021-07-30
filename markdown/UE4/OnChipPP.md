看到UE4在ios上有个`OnChipPP`来做pre-tonemap，像是对应MSAA的  
# ios
为什么能用，为什么提供这种方式？  
```
OutColor.rgb *= rcp(Color.r * 0.299 + Color.g * 0.587 + Color.b * 0.114 + 1.0)
```
# android
framebuffer fetch通常用来在不更换pass的情况下快速获取对应的值，那么在UE4现有的图式后处理结构上，来做一个framebuffer fetch可能有些困难，他似乎默认每一次后处理都是一个`pass`   
`pixel local storage`支持有限    
## 关于在BasePass中做后处理Tonemap
项目中不开HDR的情况下，可能会直接输出到backbuffer，也就意味这basepass的format和backbuffer的format是一样的，通常是RGB8。  
或许basepass输出HDR再用一个FBF的后处理tonemap的美梦破灭   
## FBF 后处理
难点仍是format的不同，即是说tonemap输出到backbuffer(LDR)上，而景深(HDR)输出到R11G11B10上面  
如果用FBF，也就意味着需要使用MRT，索引0为backbuffer，索引1为R11G11B10，景深输出带索引1  
顾虑在于，过去使用MRT时，检测到，即使是不去resolve索引1的RT，也产生了带宽消耗
## Pixel Local Storage
