import {DarkHole} from "./anim/DH-webgl2/index.js"



var anim = new DarkHole();
//document.body.insertBefore(anim.DOM(), document.getElementById('container'));

anim.DOM().style.position = 'fixed';
anim.DOM().style.top = '0';
document.body.insertBefore(anim.DOM(), document.getElementById('container'));
//document.body.append(anim.DOM());
anim.play();