记载一下shader的编译错误  
```
const float2 pos[3] = {
    {a,b},{c,d},{e,f}
};
```  
这样的hlsl编译出错，编译成了形似
```
float v = {a, b, c}
```

Assertion failed: VertexDeclarationRHI   
一个全屏shader，并没有传递顶点buffer