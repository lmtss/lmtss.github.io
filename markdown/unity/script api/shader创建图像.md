我试图创建一个缓冲区，然后只用shader处理(理论上不需摄像头)，然后再将生成的图像作为贴图贴在场景上。  
## unity中的RenderTexture
2020-1-24 [官方页面](https://docs.unity3d.com/2020.1/Documentation/ScriptReference/RenderTexture.html)  
应该是FrameBufferObject的封装。  
找了一会儿资料，似乎一般渲染到缓冲区需要command buffer，或是Graphics.Blit、Image Effect这样的，我倒是希望有个简单的方式。  
`Graphics.Blit` 似乎强制提供一个纹理作为输入，一般没什么问题，但我的需求可能不需要任何纹理输入。  
