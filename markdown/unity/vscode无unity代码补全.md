### 一般来说
通常错误是`Assembly-CSharp.csproj`这个文件中的`.NET FrameWork`版本与电脑中的版本不一致，网上答案一般是手动改这个文件中的需求版本，或者自己安装对应的版本。  
### 我的情况
emmmmm，网上的方法试过了，都不行，最后选择删除`Assembly-CSharp.csproj`还有`.sln`文件，让unity再生成一份，就有了代码补全。