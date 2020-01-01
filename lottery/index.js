import {Lottery, WebglPrizeWheel, C2DPrizeWheel, WebglParticleLottery, WPLottery} from "./lottery.js";

const fuck = new WPLottery({
    width : 400,
    height : 400,
    prizeWidth : 300,
    prizeHeight : 250
});
document.body.appendChild(fuck.DOM);
let prizeImg = new Image();
let backgroudImg = new Image();
prizeImg.onload = function(){
    backgroudImg.src = 'metal.jpg';
    document.getElementById("wtf").innerHTML = 'sdsdsds';
}
backgroudImg.onload = function(){
    document.getElementById("play").style.display = 'block';
    
}
prizeImg.src = '2222.jpg';

document.getElementById("play").onclick = function(){
    fuck.play({
        hasBackground : true,
        hasImg : true,
        img : prizeImg,
        backgroundImg : backgroudImg,
        prizeName : '一等奖',
        imgWidth : 150,
        imgHeight : 150
    });
}