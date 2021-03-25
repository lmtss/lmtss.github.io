`SlateElementPixelShader.usf`  
在一个临时的需要中，我希望取消UI材质中的gamma校正  
一个简单的做法是在custom节点中`#define ApplyGammaCorrection(x,y) x`  
这样会让gamma校正函数输出原值  

# UI的渲染 和 场景渲染
显然的，把一张用在UI中的图片放到场景里，是不会得到一样的结果的  
不过具体原因需要考虑