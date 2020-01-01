import {GLH} from "./item.js";
import {Matrix4} from "./cuon-matrix.js";
import {WebglParticle} from "./anim.js";
class Lottery{

    parentDOM;
    domElement;
    animID;
    width;
    height;

    constructor({
        DOM,
        list,
        width,
        height,
        clickFunc = null
    } = {}){
        this.parentDOM = DOM;
        console.log(list);
        this.width = width;
        this.height = height;
        
    }

    get DOM(){
        return this.domElement;
    }

    render(time){

    }

    startAnimate(){
        let that = this;
        function anim(time){
            that.render(time);
            that.animID = requestAnimationFrame(anim);
        }
        that.animID = requestAnimationFrame(anim);
    }

    pauseAnimate(){
        console.log("Sss");
        cancelAnimationFrame(this.animID);
    }
}

class C2DPrizeWheel extends Lottery{

    ctx;
    radius;
    image;
    imageLoaded = false;

    constructor({
        DOM,
        list,
        radius = 0.15,
        clickFunc = null,
        pattern = "average"
    } = {}){
        super({
            DOM : DOM,
            clickFunc : clickFunc,
            list : list
        });

        let that = this;

        let canvas = document.createElement("canvas");
        let rectParentDOM = this.parentDOM.getBoundingClientRect();
        this.width = rectParentDOM.width * radius * 2 + 2;
        this.height = rectParentDOM.width * radius * 2 + 2;
        this.radius = this.width/2 - 1;
        canvas.width = this.width;
        canvas.height = this.height;

        this.domElement = canvas;
        this.parentDOM.appendChild(canvas);

        this.ctx = canvas.getContext("2d");
        
        let image = new Image();
        image.src = "metal.jpg";
        this.image = image;
        image.onload = function(){
            that.imageLoaded = true;
        }
    }

    render(){

        let ctx = this.ctx;

        ctx.clearRect(0,0,this.width,this.height);

        if(this.imageLoaded){
            ctx.drawImage(this.image, 0, 0, this.width, this.height);
        }

        ctx.fillStyle = "red";
        
        ctx.beginPath();
        //ctx.moveTo(this.width, this.height/2);
        ctx.arc(this.width/2, this.height/2, this.radius, 0, Math.PI*2, true);
        //ctx.closePath();
        ctx.fill();
    }
}

class WebglPrizeWheel extends Lottery{

    gl;
    radius;

    prizeTexture = {
        canvas : null
    }

    resource = {
        metalTex : null,
        metalTexLoad : false,

        vertexBuffer : null
    };;

    program;

    locs = {
        posBuffer : null,
        time : 0,
        radius : 0,
        mvpMat : 0,
        metalTex : 0
    };

    camera = {
        viewMatrix : null,
        projMatrix : null,
        modelMatrix : null
    };

    constructor({
        DOM,
        list,
        radius = 0.2,
        clickFunc = null,
        pattern = "average"
    } = {}){
        super({
            DOM : DOM,
            clickFunc : clickFunc,
            list : list
        });

        let canvas = document.createElement("canvas");
        let rectParentDOM = this.parentDOM.getBoundingClientRect();
        this.width = rectParentDOM.width * radius * 2 + 2;
        this.height = rectParentDOM.width * radius * 2 + 2;

        this.radius = this.width/2 - 1;
        canvas.width = this.width;
        canvas.height = this.height;

        this.domElement = canvas;
        this.parentDOM.appendChild(canvas);

        this.initGL();
        this.initWheel();
        this.loadResource();
    }

    initGL(){

        let gl = GLH.createGL(this.domElement);
        if(!gl){

        }
        this.gl = gl;

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        this.program = GLH.createProgram(gl, document.getElementById("wheelVS").innerHTML, document.getElementById("wheelFS").innerHTML);
        gl.useProgram(this.program);

        this.locs = {
            posBuffer : gl.getAttribLocation(this.program, 'vertexPos'),
            time : gl.getUniformLocation(this.program, 'time'),
            radius : gl.getUniformLocation(this.program, 'radius'),
            mvpMat : gl.getUniformLocation(this.program, 'mvpMat'),
            metalTex : gl.getUniformLocation(this.program, 'metalTex')
        };


        // mat
        this.camera.viewMatrix = new Matrix4();
        this.camera.projMatrix = new Matrix4();
        this.camera.modelMatrix = new Matrix4();

        //this.camera.modelMatrix.setRotate(-60, 1, 0, 0);
        this.camera.viewMatrix.setLookAt(0, 0, 2.5, 0, 0, 0, 0, 1, 0);
        this.camera.projMatrix.setPerspective(45, this.width/this.height, 1, 1000);

        let mvpMatrix = new Matrix4();
        mvpMatrix.set(this.camera.projMatrix).multiply(this.camera.viewMatrix).multiply(this.camera.modelMatrix);
        console.log(mvpMatrix.elements);
        
    }

    initWheel(){

        let gl = this.gl;
        let arr = new Float32Array([
            1, 1, 0,
            -1, 1, 0,
            1, -1, 0,
            -1, -1, 0,
        ]);

        let vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.locs.posBuffer, 3, gl.FLOAT, false, arr.BYTES_PER_ELEMENT * 3, 0);
        gl.enableVertexAttribArray(this.locs.posBuffer);
        //gl.u

        this.resource.vertexBuffer = vertexBuffer;
    }

    loadResource(){

        var that = this;

        var image = new Image();
        image.src = "metal.jpg";
        image.onload = function(){

            that.resource.metalTex = GLH.createImgTexture(that.gl, 0, 0, image, 0);

            that.resource.metalTexLoad = true;

            that.gl.uniform1i(that.locs.metalTex, 0);
        }

    }
    initPrizeTexture(list){
        let canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;

        this.prizeTexture.canvas = canvas;
        this.createPrizeTexture(list);
    }
    createPrizeTexture(list){
        let ctx = this.prizeTexture.canvas.getContext("2d");
        let numPrize = list.length;
        for(let prize of list){

        }

    }

    render(time){

        //console.log(time);

        let gl = this.gl;

        gl.clearColor(0,0,0,1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        this.camera.modelMatrix.setRotate(time, 0, 0);
        let mvpMatrix = new Matrix4();
        mvpMatrix.set(this.camera.projMatrix).multiply(this.camera.viewMatrix).multiply(this.camera.modelMatrix);

        gl.useProgram(this.program);

        gl.uniformMatrix4fv(this.locs.mvpMat, false, mvpMatrix.elements);
        //console.log(mvpMatrix.elements);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.resource.vertexBuffer);
        gl.vertexAttribPointer(this.locs.posBuffer, 3, gl.FLOAT, false, 4 * 3, 0);

        

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        //console.log("s");
    }
}

class WebglParticleLottery extends Lottery{

    gl;
    prizeWidth = 0;
    prizeHeight = 0;
    feedbackPos;
    feedbackVelocity;
    firstRun = true;
    prizeNameSize = 30;

    locations = {
        time : 0,
        prizeWidth : 0,
        prizeHeight : 0,
        metalTex : 0,
        numRun : 0,
        resolution : 0
    };

    resource = {
        metalImg : null,
        metalTex : null,
        metalTexLoad : false
    };

    constructor({
        DOM,
        list,
        width = window.innerWidth,
        height = window.innerHeight,
        prizeWidth = 0.5 * window.innerWidth,
        prizeHeight = 0.2 * window.innerHeight,
        clickFunc = null,
        prizeNameSize = 30
    } = {}){
        super({
            DOM : DOM,
            clickFunc : clickFunc,
            list : list,
            width : width,
            height : height
        });
        let canvas = document.createElement("canvas");

        canvas.width = this.width;
        canvas.height = this.height;

        /*this.prizeWidth = Math.floor(this.width * prizeWidth);
        this.prizeHeight = Math.floor(this.height * prizeHeight);*/
        this.prizeWidth = prizeWidth;
        this.prizeHeight = prizeHeight;

        this.domElement = canvas;
        this.parentDOM.appendChild(canvas);

        this.prizeNameSize = prizeNameSize;

        this.initGL();
        this.loadResource();
    }
    initGL(){
        let gl = GLH.createGL(this.domElement);
        if(!gl){

        }
        this.gl = gl;

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        this.program = GLH.createProgram(gl, document.getElementById("particleVS").innerHTML, document.getElementById("particleFS").innerHTML, ['feedbackVertexPos']);
        gl.useProgram(this.program);

        this.locations.time = gl.getUniformLocation(this.program, 'time');
        this.locations.prizeWidth = gl.getUniformLocation(this.program, 'prizeWidth');
        this.locations.prizeHeight = gl.getUniformLocation(this.program, 'prizeHeight');
        this.locations.metalTex = gl.getUniformLocation(this.program, 'metalTex');
        this.locations.numRun = gl.getUniformLocation(this.program, 'numRun');
        this.locations.resolution = gl.getUniformLocation(this.program, 'resolution');

        gl.uniform1i(this.locations.prizeWidth, this.prizeWidth);
        gl.uniform1i(this.locations.prizeHeight, this.prizeHeight);
        gl.uniform1i(this.locations.numRun, 0);
        gl.uniform2f(this.locations.resolution, this.width, this.height);

        this.numParticle = this.prizeHeight * this.prizeWidth;
        let arr = [];
        for(let i = 0; i < this.numParticle; i++){
            arr[i*3] = Math.random() * 2 - 1;
            arr[i*3 + 1] = Math.random() * 2 - 1;
            arr[i*3 + 2] = 0;
        }
        // x, y, z
        this.feedbackPos = new GLH.FeedbackABO(gl, new Float32Array(arr), this.numParticle * 12, gl.getAttribLocation(this.program, 'vertexPos'), 3, 0, true);
        console.log("num: " + this.numParticle + "  w: " + this.prizeWidth + " h: " + this.prizeHeight);
        
    }

    loadResource(){

        var that = this;

        var image = new Image();
        image.src = "metal.jpg";
        this.resource.metalImg = image;
        image.onload = function(){
            console.log("metax jpg loaded");
            that.createTexture('一等奖: QQ会员', '2222.jpg', 100, 100);
            /*that.resource.metalTex = GLH.createImgTexture(that.gl, 0, 0, image, 0);
            console.log("metax jpg loaded");
            that.resource.metalTexLoad = true;

            that.gl.uniform1i(that.locations.metalTex, 0);*/
        }

        



    }

    createTexture(prizeName, src, w, h){
        var canvas = document.createElement("canvas");
        canvas.width = this.prizeWidth;
        canvas.height = this.prizeHeight;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(this.resource.metalImg, 0, 0, this.prizeWidth, this.prizeHeight);

        ctx.fillStyle = 'black';
        ctx.font = 'normal ' + this.prizeNameSize + 'px 微软雅黑';
        ctx.fillText(prizeName, 0, this.prizeHeight);

        var img = new Image();
        img.src = src;

        var that = this;
        img.onload = function(){
            ctx.drawImage(img, (that.prizeWidth - w) / 2.0, 20.0, w, h);

            that.resource.metalTex = GLH.createImgTexture(that.gl, 0, 0, canvas, 0);
        
            that.resource.metalTexLoad = true;
    
            that.gl.uniform1i(that.locations.metalTex, 0);
        }
        

        

    }

    render(time){

        if(this.resource.metalTexLoad){
            let gl = this.gl;
            // uniform
            gl.uniform1f(this.locations.time, time);
            
    
            gl.clear(gl.COLOR_BUFFER_BIT);
    
            gl.useProgram(this.program);
    
            this.feedbackPos.begin(gl.POINTS);
            gl.drawArrays(gl.POINTS, 0, this.numParticle);
            this.feedbackPos.end();

            if(this.firstRun){
                gl.uniform1i(this.locations.numRun, 1);
            }
        }
        

    }
}

class WPLottery{

    anim;
    prizeWidth;
    prizeHeight;
    resource = {
        backgroundImg : null,
        backgroundImgLoaded : false
    }
    

    constructor({
        width = window.innerWidth,
        height = window.innerHeight,
        prizeWidth = 0.5 * window.innerWidth,
        prizeHeight = 0.2 * window.innerHeight,
        prizeNameSize = 30
    } = {}){
        this.anim = new WebglParticle({
            width : width,
            height : height,
            prizeWidth : prizeWidth,
            prizeHeight : prizeHeight,
            prizeNameSize : 30
        });
        this.prizeWidth = prizeWidth;
        this.prizeHeight = prizeHeight;
        this.anim.startAnimate();
    }
    setBackground(url){
        let img = new Image();
        
        this.resource.backgroundImgLoaded = false;

        var that = this;
        img.onload = function(){
            that.resource.backgroundImgLoaded = true;
        }
        img.src = url;
        this.resource.backgroundImg = img;
    }
    createTexture({
        
        hasImg = false,
        img = null,
        imgWidth = 50,
        imgHeight = 50,
        prizeName = 'WTF',
        backgroundImg = null,
        hasBackground = false
    }){

        let canvas = document.createElement("canvas");
        canvas.width = this.prizeWidth;
        canvas.height = this.prizeHeight;

        let ctx  = canvas.getContext("2d");
        
        if(hasBackground){
            ctx.drawImage(backgroundImg, 0, 0, this.prizeWidth, this.prizeHeight);
        }
        if(hasImg){
            ctx.drawImage(img, (this.prizeWidth - imgWidth) / 2, 20, imgWidth, imgHeight);
        }
        ctx.fillStyle = 'black';
        ctx.font = 'normal 30px 微软雅黑';
        let size = ctx.measureText(prizeName);
        ctx.fillText(prizeName, (this.prizeWidth - size.width) / 2, this.prizeHeight);

        this.anim.setTexture(canvas);
    }

    play({
        
        hasImg = false,
        img = null,
        imgWidth = 50,
        imgHeight = 50,
        prizeName = 'WTF',
        backgroundImg = null,
        hasBackground = false
    } = {}){
        this.createTexture({
            hasImg : hasImg,
            img : img,
            imgWidth : imgWidth,
            imgHeight : imgHeight,
            prizeName : prizeName,
            backgroundImg : backgroundImg,
            hasBackground : hasBackground
        });
        
    }

    get DOM(){
        return this.anim.DOM;
    }
}
export {Lottery, WebglPrizeWheel, C2DPrizeWheel, WebglParticleLottery, WPLottery};