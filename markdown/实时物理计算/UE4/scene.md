如何把想要的物体数据传入物体模拟器？  
## SceneVisibility
就像把物体分到各个Pass一样，修改`FPrimitiveViewRelevance`结构，新增一个`EMeshPass`的枚举以及相对应Pass的Processor代码    
另一种是用类似体积材质渲染的方式，不用`EMeshPass`的形式，较为自由  
考虑到需求特殊，用后者比较好吧  
刚注意到，HairStrand的目录看起来是Niagara实现的，目录(UE5)`Plugins\Runtime\HairStrands\Source\HairStrandsCore\Private\Niagara`