var particles_sum = 0;
var testPtr = [
    {
        kind:"line",
        x:10,
        y:10
    },
    {
        kind:"line",
        x:7,
        y:100
    },
    {
        kind:"bezier2",
        conx:0,
        cony:120,
        x:4,
        y:180
    },
    {
        kind:"bezier2",
        conx:0,
        cony:195,
        x:7,
        y:196
    },
    {
        kind:"line",
        x:0,
        y:222
    }
];
//alert(window.innerHeight);
var DefaultSet = {
    backgroundcolor:"black",
    MainGear:{
        CenterX:0.5,
        CenterY:0.33333,
        tooth:{
            num:13,
            bottomWidth:40,
            upWidth:25,
            height:22,
            anti_density:17,
            color:"rgba(229,119,53,1)",
            borderColor:"rgba(229,119,53,1)"
        },
        outermost:{
            radius:0.25,
            thickness:14,
            speed:-0.05,
            anti_density:20,
            color:"rgba(229,119,53,1)",
            borderColor:"rgba(229,119,53,1)"
        },
        inner:[
            {
                margin:4,
                thickness:13,
                speed:0.01,
                anti_density:24,
                color:"rgba(217,144,94,1)",
                borderColor:"rgba(255,201,56,1)"
            },
            {
                margin:7,
                thickness:50,
                speed:0.04,
                anti_density:24,
                color:"rgba(217,144,94,1)",
                borderColor:"rgba(255,201,56,1)"
            },
            {
                margin:6,
                thickness:3,
                speed:0.01,
                anti_density:20,
                color:"rgba(217,144,94,1)",
                borderColor:"rgba(255,201,56,1)"
            },
            {
                margin:2,
                thickness:3,
                speed:0.01,
                anti_density:20,
                color:"rgba(217,144,94,1)",
                borderColor:"rgba(255,201,56,1)"
            },
            {
                margin:2,
                thickness:3,
                speed:0.01,
                anti_density:20,
                color:"rgba(217,144,94,1)",
                borderColor:"rgba(255,201,56,1)"
            },
            {
                margin:4,
                thickness:30,
                speed:-0.05,
                anti_density:24,
                color:"rgba(217,144,94,1)",
                borderColor:"rgba(255,201,56,1)"
            },
            {
                margin:4,
                thickness:8,
                speed:0.05,
                anti_density:24,
                color:"rgba(217,144,94,1)",
                borderColor:"rgba(255,201,56,1)"
            },
            {
                margin:4,
                thickness:14,
                speed:0.04,
                anti_density:24,
                color:"rgba(217,144,94,1)",
                borderColor:"rgba(255,201,56,1)"
            }
        ],
        digital:{
            height:42,
            font:"42px Serif",
            borderColor:"rgba(255,213,76,1)",
            color:"rgba(255,213,76,1)",
            con:[
                {
                    text:"XII",
                    x:-16,
                    y:-155,
                    interval:[-9, -5]
                },
                {
                    text:"I",
                    x:60,
                    y:-140,
                    interval:[]
                },
                {
                    text:"II",
                    x:98,
                    y:-95,
                    interval:[-5]
                },
                {
                    text:"III",
                    x:110,
                    y:-23,
                    interval:[-4,-4]
                },
                {
                    text:"IV",
                    x:98,
                    y:47,
                    interval:[-8]
                },
                {
                    text:"V",
                    x:55,
                    y:90,
                    interval:[]
                },
                {
                    text:"VI",
                    x:-13,
                    y:107,
                    interval:[-5]
                }
                ,
                {
                    text:"VII",
                    x:-87,
                    y:90,
                    interval:[-8,-5]
                }
                ,
                {
                    text:"VIII",
                    x:-130,
                    y:47,
                    interval:[-10,-7,-7]
                }
                ,
                {
                    text:"IX",
                    x:-152,
                    y:-23,
                    interval:[-5]
                },
                {
                    text:"X",
                    x:-130,
                    y:-95,
                    interval:[]
                },
                {
                    text:"XI",
                    x:-87,
                    y:-140,
                    interval:[-5]
                }
            ]
        },
        ptrs:[
            {width:20,height:300,center:5},
            {width:20,height:240,center:5},
            {width:20,height:200,center:5}
        ]
    },
    SubGear:[
        {
            CenterX:0.29,
            CenterY:0.25,
            radius:0.08,
            thickness:25,
            toothNum:13,
            upWidth:16,
            bottomWidth:23,
            height:14,
            tooth_anti_density:18,
            circle_anti_density:18,
            speed:0.06
        },
        {
            CenterX:0.36,
            CenterY:0.6,
            radius:0.055,
            thickness:19,
            toothNum:13,
            upWidth:12,
            bottomWidth:18,
            height:9,
            tooth_anti_density:18,
            circle_anti_density:18,
            speed:-0.06
        },
        {
            CenterX:0.185,
            CenterY:0.6,
            radius:0.11,
            thickness:35,
            toothNum:13,
            upWidth:21,
            bottomWidth:31,
            height:20,
            tooth_anti_density:18,
            circle_anti_density:18,
            speed:0.08
        },
        {
            CenterX:0.1,
            CenterY:0.22,
            radius:0.08,
            thickness:25,
            toothNum:13,
            upWidth:16,
            bottomWidth:23,
            height:14,
            tooth_anti_density:18,
            circle_anti_density:18,
            speed:0.06
        },
        {
            CenterX:0.685,
            CenterY:0.23,
            radius:0.06,
            thickness:19,
            toothNum:13,
            upWidth:14,
            bottomWidth:20,
            height:10,
            tooth_anti_density:18,
            circle_anti_density:18,
            speed:-0.06
        },
        {
            CenterX:0.7,
            CenterY:0.58,
            radius:0.105,
            thickness:33,
            toothNum:13,
            upWidth:21,
            bottomWidth:31,
            height:20,
            tooth_anti_density:18,
            circle_anti_density:18,
            speed:0.08
        },
        {
            CenterX:0.89,
            CenterY:0.28,
            radius:0.105,
            thickness:33,
            toothNum:13,
            upWidth:21,
            bottomWidth:31,
            height:20,
            tooth_anti_density:18,
            circle_anti_density:18,
            speed:0.08
        },
        {
            CenterX:0.9,
            CenterY:0.68,
            radius:0.08,
            thickness:25,
            toothNum:13,
            upWidth:16,
            bottomWidth:23,
            height:14,
            tooth_anti_density:18,
            circle_anti_density:18,
            speed:0.06
        }
    ]
};
function rand(sum,num) {
    var arr = [];
    for(var i = 0; i < sum; i++)
        arr.push(i);
    var retArr = [];
    /*for(var i = 0; i <sum/num; i++)
     retArr.push(arr.splice(Math.floor(arr.length*Math.random()),1));*/
    for(var i = 0; i <sum/num; i++){
        var t = 0;
        var cishu = 0;
        while (1){
            t = Math.floor(sum*Math.random());
            cishu++;
            if(retArr.indexOf(t) == -1 && retArr.indexOf(t+1) == -1 && retArr.indexOf(t-1) == -1){
                retArr.push(t);
                break;
            }
            if(cishu == 1000){
                retArr.push(t);
                break;
            }
        }
        //retArr.push(Math.floor(sum*Math.random()));
    }

    return retArr;
}
function BackgroundParticle(width,height) {

    this.x = Math.random();
    if(this.x > 0.5){
        this.x = 0;
        this.vx = Math.random()*0.5;
    }
    else{
        this.x = width;
        this.vx = -Math.random()*0.5;
    }
    this.y = Math.random()*height;
    if(this.y > height/2){
        this.vy = -Math.random()*0.05;
    }
    else
        this.vy = Math.random()*0.05;


}
BackgroundParticle.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
};
function MJQX_gear(canvas,set,isAdapt) {
    this.MainScreen = canvas;
    this.screen = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.screen.width = window.innerWidth*2;
    this.screen.height = window.innerHeight*2;
    this.ctx = this.screen.getContext("2d");
    this.MainCtx = canvas.getContext("2d");

    this.test = null;
    this.backgroundParticles = [];
    this.DefaultSet = set;
    if(isAdapt){
        this.setByJson(this.adaptScreen(this.DefaultSet));
    }
    else
        this.setByJson(this.DefaultSet);
}
MJQX_gear.prototype.adaptScreen = function (set) {
    //if(window.innerWidth == 1536)return set;
    var rate = this.screen.width/1536;
    var rate2 = this.screen.height/759;
    /*if(window.innerWidth < window.innerHeight){
        rate = rate2;
    }*/
    /********************** Main Gear *************************/
    //outermost
    var tooth = set.MainGear.tooth;
    tooth.bottomWidth *= rate2;
    tooth.upWidth *= rate2;
    tooth.height *= rate2;
    set.MainGear.outermost.thickness *= rate2;
    //inner
    for(var i = 0; i < set.MainGear.inner.length; i++){
        var gear = set.MainGear.inner[i];
        gear.margin *= rate2;
        gear.thickness *= rate2;
    }
    //digital
    var temp = set.MainGear.digital;
    temp.height *= rate2;

    temp.font = Math.floor(temp.height)+"px Serif";
    for(i = 0; i < set.MainGear.digital.con.length; i++){
        temp = set.MainGear.digital.con[i];
        temp.x *= rate2;
        temp.y *= rate2;
        for(var j = 0; j < temp.interval.length; j++){
            temp.interval[j] *= rate2;
        }
    }

    /********************** Sub Gear ***************************/
    for(i = 0; i < set.SubGear.length; i++){
        gear = set.SubGear[i];
        gear.upWidth *= rate;
        gear.bottomWidth *= rate;
        gear.height *= rate;
        gear.thickness *= rate;
    }

    return set;
};
MJQX_gear.prototype.setByJson = function (set) {
    this.backgroundcolor = set.backgroundcolor;

    var sWidth = this.screen.width;
    var sHeight = this.screen.height;
    var rate = sWidth/1536;
    var rate2 = sHeight/759;

    /********************************中央齿轮设置*********************************/
    this.MainGear = set.MainGear;
    this.MainGear.CenterX = this.screen.width*this.MainGear.CenterX;
    this.MainGear.CenterY = this.screen.height*this.MainGear.CenterY;
    //中央齿轮 最外圈设置
    this.MainGear.outermost.canvas = document.createElement("canvas");
    this.MainGear.outermost.radius = this.screen.height*this.MainGear.outermost.radius;
    /*this.MainGear.tooth.height *= rate2;
    this.MainGear.tooth.upWidth *= rate2;
    this.MainGear.tooth.bottomWidth *= rate2;
    this.MainGear.outermost.thickness *= rate2;*/
    this.MainGear.outermost.canvas.width = (this.MainGear.outermost.radius + this.MainGear.tooth.height)*2;
    this.MainGear.outermost.canvas.height = (this.MainGear.outermost.radius + this.MainGear.tooth.height)*2;
    this.MainGear.outermost.deg = 0;

    //中央齿轮 内圈设置
    for(var i = 0; i < this.MainGear.inner.length; i++){
        var circle = this.MainGear.inner[i];
        if(i == 0){
            circle.radius = this.MainGear.outermost.radius - this.MainGear.outermost.thickness - circle.margin;
        }else{
            circle.radius = this.MainGear.inner[i-1].radius - this.MainGear.inner[i-1].thickness - circle.margin;
        }
        circle.canvas = document.createElement("canvas");
        circle.canvas.width = circle.radius*2;
        circle.canvas.height = circle.radius*2;
        circle.deg = 0;
    }
    //数字设置
    this.MainGear.digital.canvas = document.createElement("canvas");
    /*this.MainGear.digital.height *= rate2;
    this.MainGear.digital.font = Math.floor(this.MainGear.digital.height) + "px Serif";
    for(i = 0; i < this.MainGear.digital.con.length; i++){
        var t = this.MainGear.digital.con[i];
        t.x *= rate2;
        t.y *= rate2;
        for(var j = 0; j < t.interval.length; j++){
            t.interval[j] *= rate2;
        }
    }*/
    this.MainGear.digital.canvas.width = this.MainGear.inner[1].canvas.width;
    this.MainGear.digital.canvas.height = this.MainGear.inner[1].canvas.height;
    //指针设置

    for(var i = 0; i < 3; i++){
        this.MainGear.ptrs[i].canvas = document.createElement("canvas");
        this.MainGear.ptrs[i].canvas.width = this.MainGear.ptrs[i].width;
        this.MainGear.ptrs[i].canvas.height = this.MainGear.ptrs[i].height;
        this.MainGear.ptrs[i].deg = 0;
    }
    var myDate = new Date();
    var temp = myDate.getHours();
    if(temp >= 12)
        temp -= 12;
    this.MainGear.hour = myDate.getHours();
    this.MainGear.minute = myDate.getMinutes();
    this.MainGear.second = myDate.getSeconds();
    this.MainGear.ptrs[2].deg = temp/12 * 360;
    this.MainGear.ptrs[1].deg = this.MainGear.minute/60 * 360;
    this.MainGear.ptrs[0].deg = this.MainGear.second/60 * 360;

    /*************************************其他齿轮设置***********************************/
    this.SubGear = set.SubGear;
    for(i = 0; i < this.SubGear.length; i++){
        var gear = this.SubGear[i];
        gear.CenterX = this.screen.width*gear.CenterX;
        gear.CenterY = this.screen.height*gear.CenterY;
        gear.radius = this.screen.width*gear.radius;
        gear.canvas = document.createElement("canvas");
        gear.canvas.width = (gear.radius + gear.height)*2;
        gear.canvas.height = (gear.radius + gear.height)*2;
        gear.deg = 0;

        /*gear.upWidth *= rate;
        gear.bottomWidth *= rate;
        gear.height *= rate;
        gear.thickness *= rate;*/
    }

};

MJQX_gear.prototype.setMainGear = function () {

};
MJQX_gear.prototype.init = function () {
    var ctx = this.ctx;
    var grd = ctx.createLinearGradient(0,0,0,this.screen.height);
    grd.addColorStop(0,"black");
    grd.addColorStop(1,"rgba(77,31,1,1)");
    ctx.fillStyle = grd;
    ctx.fillRect(0,0,this.screen.width,this.screen.height);
    this.drawMainGear();

    this.drawSubGear();

    this.drawPtrs();

};
MJQX_gear.prototype.becomeParticles = function (canvas,xishu,color) {
    xishu = xishu||7;
    color = color||"rgba(217,144,94,1)";
    var cache = document.createElement("canvas");
    cache.width = canvas.width;
    cache.height = canvas.height;
    var ctx = cache.getContext("2d");

    var ImgData = canvas.getContext("2d").getImageData(0,0,canvas.width,canvas.height);
    var buffer32 = new Uint32Array(ImgData.data.buffer);

    var mdzz = [];
    for(var i = 0; i < buffer32.length; i++){
        if(buffer32[i]){
            mdzz.push(i);
        }
    }

    var AKuYa = rand(mdzz.length,xishu);
    var ptr = 0;
    var x = 0;
    var y = 0;
//217 144 94
    ctx.fillStyle = color;
    for(i = 0; i < AKuYa.length; i++){
        ptr = mdzz[AKuYa[i]];
        //alert(AKuYa[i]);
        var t = ptr/cache.width;
        y = Math.floor(t);
        x = ptr - y*cache.width;
        ctx.fillRect(x,y,0.8,1);
    }
    particles_sum += AKuYa.length;

    return cache;
};
MJQX_gear.prototype.drawCircle = function (radius,thickness,color) {
    var cache = document.createElement("canvas");
    var ctx = cache.getContext("2d");
    cache.width = radius*2;
    cache.height = radius*2;

    ctx.arc(radius,radius,radius - thickness,0,2*Math.PI);
    ctx.fill();

    ctx.globalCompositeOperation = "source-out";
    ctx.arc(radius,radius,radius-1,0,2*Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    return cache;
};
MJQX_gear.prototype.drawTooth = function (radius,upLength,bottomLength,height,num,color,style) {
    radius = radius - 1;
    style = style||"fill";
    var cache = document.createElement("canvas");
    cache.width = (radius+height)*2;
    cache.height = (radius+height)*2;
    var ctx = cache.getContext("2d");

    var ptr = 0;
    var interval = 2*Math.PI/num;
    var bottom = Math.sqrt(radius*radius - (bottomLength/2)*(bottomLength/2));

    ctx.fillStyle = color;
    for(var i = 0; i < num; i++){
        ctx.save();
        ctx.translate(radius+height,radius+height);
        ctx.rotate(ptr);
        //draw
        ctx.moveTo(-bottomLength/2,-bottom);
        ctx.lineTo(bottomLength/2,-bottom);
        ctx.lineTo(upLength/2,-bottom-height);
        ctx.lineTo(-upLength/2,-bottom-height);
        ctx.lineTo(-bottomLength/2,-bottom);
        if(style == "fill")
            ctx.fill();
        else
            ctx.stroke();
        ctx.restore();
        ptr += interval;
    }

    return cache;
};
MJQX_gear.prototype.drawText = function (text,font,height,style) {
    style = style||"fill";
    var cache = document.createElement("canvas");
    var ctx = cache.getContext("2d");
    var width = 0;
    ctx.font = font;
    width = ctx.measureText(text).width;
    cache.width = width;
    ctx.font = font;
    if(style == "fill")
        ctx.fillText(text,0,height);
    else
        ctx.strokeText(text,0,height);
    return cache;

};
MJQX_gear.prototype.drawAD = function (num) {

    var cache = document.createElement("canvas");
    var ctx = cache.getContext("2d");
    cache.width = 400;
    cache.height = this.MainGear.digital.height;

    /*ctx.fillStyle = "red";
    ctx.fillRect(0,0,3,3);*/
    var con = this.MainGear.digital.con[num];
    var text = con.text;
    var font = this.MainGear.digital.font;
    var height = this.MainGear.digital.height;
    var ptr = 0;
    ctx.strokeStyle = this.MainGear.digital.borderColor;
    ctx.font = font;
    for(var i = 0; i < text.length; i++){

        var fill = this.drawText(text[i],font,height,"fill");
        fill = this.becomeParticles(fill,4,this.MainGear.digital.color);
        ctx.drawImage(fill,ptr,0);
        ctx.strokeText(text[i],ptr,height);

        if(i!=text.length-1){
            ptr += con.interval[i] + ctx.measureText(text[i]).width;
        }
    }
    return cache;
};
MJQX_gear.prototype.drawDigital = function () {
    var center = this.MainGear.digital.canvas.width/2;
    var ctx = this.MainGear.digital.canvas.getContext("2d");
    /*ctx.fillStyle = "red";
    ctx.fillRect(0,0,5,5);
    ctx.fillRect(center,center,5,5);*/
    for(var i = 0; i < this.MainGear.digital.con.length; i++){

        ctx.drawImage(this.drawAD(i),center+this.MainGear.digital.con[i].x,center+this.MainGear.digital.con[i].y);

    }
};
MJQX_gear.prototype.drawPtr = function (json,style) {
    style = style||"fill";
    var cache = document.createElement("canvas");
    var width = 0;
    var height = 0;

    for(var i = 0; i < json.length; i++){
        if(width < json[i].x)
            width = json[i].x;
    }
    cache.width = width*2 + 1;
    cache.height = json[json.length-1].y + 2;

    var ctx = cache.getContext("2d");
    ctx.moveTo(cache.width/2,cache.height);
    var startX = cache.width/2;
    var startY = cache.height;
    for(i = 0; i < json.length; i++){
        var t = json[i];
        if(t.kind == "line"){
            ctx.lineTo(startX + t.x,startY - t.y);
        }else{
            ctx.quadraticCurveTo(startX + t.conx,startY - t.cony,startX + t.x,startY - t.y);
        }
    }
    ctx.lineTo(startX,startY);
    for(i = 0; i < json.length; i++){
        var t = json[i];
        if(t.kind == "line"){
            ctx.lineTo(startX - t.x,startY - t.y);
        }else{
            ctx.quadraticCurveTo(startX - t.conx,startY - t.cony,startX - t.x,startY - t.y);
        }
    }
    ctx.fillStyle = "gold";
    if(style == "fill")
        ctx.fill();
    else
        ctx.stroke();

    return cache;
};
MJQX_gear.prototype.drawPtrs = function () {
    var ptrs = this.MainGear.ptrs;
    var mdzz = this.drawPtr(testPtr);
    var mdzz2 = this.drawPtr(testPtr,"stroke");
    var ptr = this.becomeParticles(mdzz,2,"rgba(255,213,76,1)");
    var ptr2 = this.becomeParticles(mdzz2,2,"gold");
    //var ptr = mdzz;
//255 224 11
    //255 213 76
    //203 132 9
    for(var i = 0; i < 3; i++){
        var canvas = ptrs[i].canvas;

        var ctx = canvas.getContext("2d");
        //ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(ptr,canvas.width/2 - ptrs[i].width/2,canvas.height - ptrs[i].height,ptrs[i].width,ptrs[i].height);
        ctx.drawImage(ptr2,canvas.width/2 - ptrs[i].width/2,canvas.height - ptrs[i].height,ptrs[i].width,ptrs[i].height);
    }
};
MJQX_gear.prototype.drawMainGear = function () {
    //最外圈 && 齿
    var center = this.MainGear.outermost.canvas.width/2;
    var ctx = this.MainGear.outermost.canvas.getContext("2d");
    var circle = this.drawCircle(this.MainGear.outermost.radius,this.MainGear.outermost.thickness,"black");
    var tooth = this.drawTooth(this.MainGear.outermost.radius,this.MainGear.tooth.upWidth,this.MainGear.tooth.bottomWidth,this.MainGear.tooth.height,this.MainGear.tooth.num,"black");
    circle = this.becomeParticles(circle,this.MainGear.outermost.anti_density,this.MainGear.outermost.color);
    tooth = this.becomeParticles(tooth,this.MainGear.tooth.anti_density,this.MainGear.tooth.color);
    ctx.drawImage(circle,center - circle.width/2,center - circle.height/2);
    ctx.drawImage(tooth,center - tooth.width/2,center - tooth.height/2);
    //tooth border
    tooth = this.drawTooth(this.MainGear.outermost.radius,this.MainGear.tooth.upWidth,this.MainGear.tooth.bottomWidth,this.MainGear.tooth.height,this.MainGear.tooth.num,"black","border");
    tooth = this.becomeParticles(tooth,4,this.MainGear.tooth.borderColor);
    ctx.drawImage(tooth,center - tooth.width/2,center - tooth.height/2);
    //outer border
    circle = this.drawCircle(this.MainGear.outermost.radius,2,"black");
    circle = this.becomeParticles(circle,4,this.MainGear.outermost.borderColor);
    ctx.drawImage(circle,center - circle.width/2,center - circle.height/2);
    //inner border
    circle = this.drawCircle(this.MainGear.outermost.radius - this.MainGear.outermost.thickness + 3,2,"black");
    circle = this.becomeParticles(circle,4,this.MainGear.outermost.borderColor);
    ctx.drawImage(circle,center - circle.width/2,center - circle.height/2);
//255 201 56
    //内圈
    for(var i = 0; i < this.MainGear.inner.length; i++){
        var temp = this.MainGear.inner[i];
        center = temp.canvas.width/2;
        ctx = temp.canvas.getContext("2d");
        circle = this.drawCircle(temp.radius,temp.thickness,"black");
        circle = this.becomeParticles(circle,temp.anti_density,temp.color);
        ctx.drawImage(circle,center - circle.width/2,center - circle.height/2);
        //outer border
        circle = this.drawCircle(temp.radius,2,"black");
        circle = this.becomeParticles(circle,5,temp.borderColor);
        ctx.drawImage(circle,center - circle.width/2,center - circle.height/2);
        //inner border
        circle = this.drawCircle(temp.radius - temp.thickness + 2,1,"black");
        circle = this.becomeParticles(circle,4,temp.borderColor);
        ctx.drawImage(circle,center - circle.width/2,center - circle.height/2);
    }
    //数字
    this.drawDigital();
};
MJQX_gear.prototype.MainGearUpdate = function () {
    this.MainGear.outermost.deg += this.MainGear.outermost.speed;
    for(var i = 0; i < this.MainGear.inner.length; i++){
        var temp = this.MainGear.inner[i];
        temp.deg += temp.speed;
    }
};
MJQX_gear.prototype.drawSubGear = function () {
    for(var i = 0; i < this.SubGear.length; i++){
        var gear = this.SubGear[i];
        var center = gear.canvas.width/2;
        var ctx = gear.canvas.getContext("2d");

        var tooth = this.drawTooth(gear.radius,gear.upWidth,gear.bottomWidth,gear.height,gear.toothNum,"black");
        tooth = this.becomeParticles(tooth,gear.tooth_anti_density,"rgba(229,119,53,1)");
        var circle = this.drawCircle(gear.radius,gear.thickness,"black");
        circle = this.becomeParticles(circle,gear.circle_anti_density,"rgba(229,119,53,1)");
        ctx.drawImage(circle,center-circle.width/2,center-circle.width/2);
        ctx.drawImage(tooth,center-tooth.width/2,center-tooth.width/2);
//229 119 53
        //tooth border
        tooth = this.drawTooth(gear.radius,gear.upWidth,gear.bottomWidth,gear.height,gear.toothNum,"black","border");
        tooth = this.becomeParticles(tooth,3,"rgba(229,119,53,1)");
        ctx.drawImage(tooth,center-tooth.width/2,center-tooth.width/2);
        //outer border
        circle = this.drawCircle(gear.radius,2,"black");
        circle = this.becomeParticles(circle,4);
        ctx.drawImage(circle,center-circle.width/2,center-circle.width/2);
        //inner border
        circle = this.drawCircle(gear.radius-gear.thickness+2,2,"black");
        circle = this.becomeParticles(circle,4);
        ctx.drawImage(circle,center-circle.width/2,center-circle.width/2);

    }
};
MJQX_gear.prototype.SubGearUpdate = function () {
    for(var i = 0; i < this.SubGear.length; i++){
        var temp = this.SubGear[i];
        temp.deg += temp.speed;
    }

};
MJQX_gear.prototype.backUpdate = function () {
    this.ctx.fillStyle = "rgba(255,255,255,0.5)";
    for(var i = 0; i < 50; i++){
        var p = this.backgroundParticles[i];
        p.update();

        this.ctx.fillRect(p.x,p.y,2,2);
    }
};
MJQX_gear.prototype.MainGearRender = function () {
    var ctx = this.ctx;
    ctx.save();
    ctx.translate(this.MainGear.CenterX,this.MainGear.CenterY);
    ctx.rotate(this.MainGear.outermost.deg/360*2*Math.PI);
    ctx.drawImage(this.MainGear.outermost.canvas,-this.MainGear.outermost.canvas.width/2,-this.MainGear.outermost.canvas.height/2);
    ctx.restore();

    for(var i = 0; i < this.MainGear.inner.length; i++){
        var temp = this.MainGear.inner[i];
        ctx.save();
        ctx.translate(this.MainGear.CenterX,this.MainGear.CenterY);
        ctx.rotate(temp.deg/360*2*Math.PI);
        ctx.drawImage(temp.canvas,-temp.canvas.width/2,-temp.canvas.height/2);
        ctx.restore();
    }

    //数字
    temp = this.MainGear.digital.canvas;
    ctx.drawImage(temp,this.MainGear.CenterX - temp.width/2,this.MainGear.CenterY - temp.width/2);
    //ctx.drawImage(temp,0,0);
};
MJQX_gear.prototype.SubGearRender = function () {
    var ctx = this.ctx;
    for(var i = 0; i < this.SubGear.length; i++){
        var temp = this.SubGear[i];
        ctx.save();
        ctx.translate(temp.CenterX,temp.CenterY);
        ctx.rotate(temp.deg/360*2*Math.PI);
        ctx.drawImage(temp.canvas,-temp.canvas.width/2,-temp.canvas.height/2);
        ctx.restore();

    }
};
MJQX_gear.prototype.PtrRender = function () {
    var ctx = this.ctx;
    for(var i = 0; i < 3; i++){
        var temp = this.MainGear.ptrs[i];
        ctx.save();
        ctx.translate(this.MainGear.CenterX,this.MainGear.CenterY);
        ctx.rotate(temp.deg/360*2*Math.PI);
        ctx.drawImage(temp.canvas,-temp.canvas.width/2,-temp.height + temp.center);
        ctx.restore();

    }

};
MJQX_gear.prototype.PtrUpdate = function () {
    var myDate = new Date();
    var temp = myDate.getHours();
    if(temp >= 12)
        temp -= 12;
    this.MainGear.hour = myDate.getHours();
    this.MainGear.minute = myDate.getMinutes();
    this.MainGear.second = myDate.getSeconds();
    this.MainGear.ptrs[2].deg = temp/12 * 360;
    this.MainGear.ptrs[1].deg = this.MainGear.minute/60 * 360;
    this.MainGear.ptrs[0].deg = this.MainGear.second/60 * 360;
};
MJQX_gear.prototype.test = function () {

};
MJQX_gear.prototype.animate = function () {
    var ctx = this.ctx;

    ctx.fillStyle = this.backgroundcolor;
    ctx.fillRect(0,0,this.screen.width,this.screen.height);

    this.SubGearUpdate();
    this.SubGearRender();
    //MainGear
    this.MainGearUpdate();
    this.MainGearRender();
    this.PtrRender();
    this.PtrUpdate();


    this.MainCtx.drawImage(this.screen,0,0,this.screen.width/2,this.screen.height/2);

    var t = this;
    window.requestAnimationFrame(function () {
        setTimeout(t.animate(),1000/60);
    });
};
var test = new MJQX_gear(document.getElementById("screen"),DefaultSet,true);
test.init();
//alert(particles_sum);
test.animate();