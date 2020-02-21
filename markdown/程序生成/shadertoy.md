因为一些原因，我开始研究sdf函数  
自然的，参考[iq](http://iquilezles.org/www/articles/distfunctions/distfunctions.htm)
## 2D
### 例子-重复矩形
```cpp
//矩形，b是矩形的长宽信息
float sdBox( in vec2 p, in vec2 b ) 
{
    vec2 q = abs(p) - b;
    return min(
        max(q.x,q.y),
        0.0
        ) + length(max(q,0.0));
}
//有限的重复
vec2 opRepLim( in vec2 p, in float s, 
//lima,limb都是重复的数量
in vec2 lima, //向左向下重复
in vec2 limb  //向右向上重复
)
{
    return p-s*clamp(round(p/s),lima,limb);
}

#define radius 15.0//方形的边长信息
#define border 2.0//矩形之间的距离(margin)

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 p = fragCoord;//左下角开始(0,0)，按像素来取坐标
	
    float d;
    vec2 q = p + vec2(-(radius + border),-(radius + border));
    vec2 r = opRepLim(
                q,radius * 2.0 + border,
                vec2(0,0), //
                vec2(15,10)//向右重复15个方形，向上10个
            );
    d = sdBox( r, vec2(radius,radius) );
    
    
    vec3 col = vec3(1.0) - sign(d)*vec3(1.0,1.0,1.0);

    fragColor = vec4(col,1.0);
}
```



