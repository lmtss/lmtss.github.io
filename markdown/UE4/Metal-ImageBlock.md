ImageBlock一些时候可以看作PixelLocalStorage，比较不同的是Metal对于tile memory的使用更加深入，tile function等功能都能和image block扯上关系。相对的，FBF和PLS都显得局限。  
在`A11`，即`iOS GPU family 4`以上支持  
[官方OIT样例](https://developer.apple.com/sample-code/metal/Order-Independent-Transparency-with-Imageblocks.zip)   
显然在UE4中使用的话，难点在于交叉编译  
看起来交叉编译部分，可能是dxc或者hlslcc，两者使用方式不同，glsl是hlslcc，我们的metal是dxc。  
