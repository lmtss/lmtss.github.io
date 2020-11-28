低端机采样法线图有一定消耗，或许可以换成`sin`函数的方式  
但是实时算出的法线并不好看，先做罢
## sin函数的法线
## Gerstner Waves
$$
y=Acos(\vec{K}\cdot \vec{X_0}-\omega t)
$$
计算导数
$$
\frac{\delta y}{\delta x}=-K_xAsin(\vec{K}\cdot \vec{X_0}-\omega t)
$$
$$
\frac{\delta y}{\delta z}=-K_zAsin(\vec{K}\cdot \vec{X_0}-\omega t)
$$

