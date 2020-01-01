import {GLH} from "./item.js";
import {Matrix4} from "./cuon-matrix.js";
class ZZAnim{

    domElement;
    animID;
    width;
    height;
    camera = {
        viewMatrix : new Matrix4(),
        projMatrix : new Matrix4(),
        modelMatrix : new Matrix4()
    };

    constructor({
        width,
        height
    } = {}){
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
        cancelAnimationFrame(this.animID);
    }
}

class WebglParticle extends ZZAnim{

    gl;
    prizeWidth = 0;
    prizeHeight = 0;
    feedbackPos;
    feedbackVelocity;
    firstRun = true;
    prizeNameSize = 30;

    textureLoaded = false;

    startTime = 0;

    locations = {
        time : 0,
        prizeWidth : 0,
        prizeHeight : 0,
        metalTex : 0,
        numRun : 0,
        resolution : 0,
        mvpMat : 0
    };

    resource = {
        metalImg : null,
        metalTex : null,
        metalTexLoad : true
    };

    constructor({
        width = window.innerWidth,
        height = window.innerHeight,
        prizeWidth = 0.5 * window.innerWidth,
        prizeHeight = 0.2 * window.innerHeight,
        prizeNameSize = 30
    } = {}){
        super({
            width : width,
            height : height
        });
        let canvas = document.createElement("canvas");

        canvas.width = this.width;
        canvas.height = this.height;

        this.prizeWidth = prizeWidth;
        this.prizeHeight = prizeHeight;

        this.domElement = canvas;

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

        this.program = GLH.createProgram(gl, document.getElementById("particleVS").innerHTML, document.getElementById("particleFS").innerHTML, ['feedbackVertexPos', 'feedbackVelocity']);
        gl.useProgram(this.program);

        this.locations.time = gl.getUniformLocation(this.program, 'time');
        this.locations.prizeWidth = gl.getUniformLocation(this.program, 'prizeWidth');
        this.locations.prizeHeight = gl.getUniformLocation(this.program, 'prizeHeight');
        this.locations.metalTex = gl.getUniformLocation(this.program, 'metalTex');
        this.locations.numRun = gl.getUniformLocation(this.program, 'numRun');
        this.locations.resolution = gl.getUniformLocation(this.program, 'resolution');
        this.locations.mvpMat = gl.getUniformLocation(this.program, 'mvpMat');

        gl.uniform1i(this.locations.prizeWidth, this.prizeWidth);
        gl.uniform1i(this.locations.prizeHeight, this.prizeHeight);
        gl.uniform1i(this.locations.numRun, 0);
        gl.uniform2f(this.locations.resolution, this.width, this.height);

        this.numParticle = this.prizeHeight * this.prizeWidth;
        let arr = [];
        /*for(let i = 0; i < this.numParticle; i++){
            arr[i*4] = 0.5 * Math.cos(i * Math.PI * 2 / this.numParticle) * (Math.random() * 0.1 + 0.95);
            arr[i*4 + 1] = 0.5 * Math.sin(i * Math.PI * 2 / this.numParticle) * (Math.random() * 0.1 + 0.95);
            arr[i*4 + 2] = Math.random() * 0.2;
            arr[i*4 + 3] = 50 * Math.random();
        }*/
        for(let i = 0; i < this.numParticle; i++){
            arr[i*4] = Math.random() * 2 - 1;
            arr[i*4 + 1] = Math.random() * 2 - 1;
            arr[i*4 + 2] = 0;
            arr[i*4 + 3] = 50;
        }
        // x, y, z
        this.feedbackPos = new GLH.FeedbackABO(gl, new Float32Array(arr), this.numParticle * 16, gl.getAttribLocation(this.program, 'vertexPos'), 4, 0, false);

        this.feedbackVelocity = new GLH.FeedbackABO(gl, this.numParticle * 12, this.numParticle * 12, gl.getAttribLocation(this.program, 'vertexVelocity'), 3, 1, true);
        console.log("num: " + this.numParticle + "  w: " + this.prizeWidth + " h: " + this.prizeHeight);

        this.camera.viewMatrix.setLookAt(0, 0, 2.5, 0, 0, 0, 0, 1, 0);
        this.camera.projMatrix.setPerspective(45, this.width/this.height, 1, 1000);
        
    }

    loadResource(){


    }

    setTexture(img){
        this.resource.metalTex = GLH.createImgTexture(this.gl, 0, 0, img, 0);
        
        this.resource.metalTexLoad = true;
    
        this.gl.uniform1i(this.locations.metalTex, 0);

        this.textureLoaded = true;
    }


    render(time){

        if(this.resource.metalTexLoad){
            let gl = this.gl;
            // uniform
            gl.uniform1f(this.locations.time, time - this.startTime);
            //console.log(time - this.startTime);
            if(this.textureLoaded){
                gl.uniform1i(this.locations.numRun, 1);
                
                //this.camera.modelMatrix.setRotate(0.0, 0.0, 0.0, 1.0);
            }else{
                gl.uniform1i(this.locations.numRun, 0);
                this.startTime = time;
                //this.camera.modelMatrix.setRotate(time / 600.0, 0.0, 0.0, 1.0);
            }

            
            let mvpMatrix = new Matrix4();
            mvpMatrix.set(this.camera.projMatrix).multiply(this.camera.viewMatrix).multiply(this.camera.modelMatrix);
            gl.uniformMatrix4fv(this.locations.mvpMat, false, mvpMatrix.elements);
    
            gl.clear(gl.COLOR_BUFFER_BIT);
    
            gl.useProgram(this.program);
    
            this.feedbackPos.begin(gl.POINTS);
            this.feedbackVelocity.begin(gl.POINTS);
            gl.drawArrays(gl.POINTS, 0, this.numParticle);
            this.feedbackPos.end();
            this.feedbackVelocity.end();
        }
        

    }
}

export {WebglParticle};