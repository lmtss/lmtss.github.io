用的少，每次遇到都要先查

## 编码函数
encodeURL() 和 decodeURL()

## 获取url参数
如果用中文做url的参数，例如 `?name=谢特`，在获取参数的时候可能出问题  
比如用这个正则方式
```
function getQueryString(name) {
    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    let r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return unescape(r[2]);
    };
    return null;
 }
```  
当然现在都是用框架了，未必需要注意