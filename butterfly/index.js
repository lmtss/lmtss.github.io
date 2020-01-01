(function () {
    var vertexShader = "attribute vec4 a_Position;\n" +
        "attribute vec2 a_TexCoord;\n" +
        //"uniform mat4 modelViewMatrix;\n" +
        "uniform mat4 u_MvpMatrix;\n" +
        "uniform float time;\n" +
        "varying vec2 v_TexCoord;\n" +
        "void main() {\n" +
        "  float flapTime = radians(sin(time * 0.1 - length(a_Position.xy) / 2.0 * 2.6) * 20.0 + 25.0);\n" +
        "  float hovering = cos(time * 0.025) * 1.0 / 16.0;\n" +
        "  vec4 updatePos = vec4(\n" +
        "    cos(flapTime) * a_Position.x,\n" +
        "    a_Position.y + hovering,\n" +
        "    sin(flapTime) * abs(a_Position.x) + hovering,1.0\n" +
        "  );\n" +
        "  v_TexCoord = a_TexCoord;\n" +
        "  gl_Position = u_MvpMatrix * updatePos;\n" +
        "}",
        FSHADER_SOURCE = 'precision mediump float;\n' +
            'uniform sampler2D u_Sampler;'+
            'varying vec2 v_TexCoord;'+
        'void main() {\n' +
            'vec4 tex = texture2D(u_Sampler, v_TexCoord);'+
        '  gl_FragColor = tex;\n' + // Set the point color
        '}\n';

    var canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.display = "absolute";
    document.body.appendChild(canvas);
    var gl = getWebGLContext(canvas);
    gl.clearColor(0.5,0.5,0.5,1.0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    initShaders(gl,vertexShader,FSHADER_SOURCE);

    var pointNumPerRow = 0,
        numRow = 0,
        tex = document.createElement("img"),
        glTex = gl.createTexture(),
        modelMatrix = new Matrix4(),
        viewMatrix = new Matrix4(),
        projMatrix = new Matrix4(),
        mvpMatrix = new Matrix4(),
        time;
    tex.onload = start;
    tex.src = "tex.png";


    function createPlane(long,width,numLong,numWidth) {
        pointNumPerRow = 2 * numLong + 2;
        numRow = numWidth;
        var y = width/2,
            x = -long/2,
            longPer = long/numLong,
            widthPer = width/numWidth,
            texXPer = 1.0/numLong,
            texYPer = 1.0/numWidth,
            numPerDot = 5,
            vertices = new Float32Array(Math.floor(pointNumPerRow * numRow * numPerDot)),
            i = 0,
            j,
            elem;
        for(; i < numWidth; i++){
            for(j = 0; j < numLong + 1; j++){
                elem = (i*pointNumPerRow + j*2)*numPerDot;
                // 下方点 i*pointNumPerRow + j*2第多少点
                vertices[elem] = x + j*longPer;//x
                vertices[elem + 1] = y - (i+1)*widthPer;//y
                vertices[elem + 2] = 0;
                vertices[elem + 3] = j*texXPer;
                vertices[elem + 4] = 1.0 - (i+1)*widthPer;

                // 上方点
                vertices[elem + 5] = x + j*longPer;
                vertices[elem + 6] = y - i*widthPer;
                vertices[elem + 7] = 0;
                vertices[elem + 8] = j*texXPer;
                vertices[elem + 9] = 1.0 - i*texYPer;
            }
        }
        return vertices;

    }


    function initBuffer() {
        var verticesColors = createPlane(2.0,1.0,24,12);
        console.log(verticesColors);
        var vertexBuffer = gl.createBuffer(),
            FSIZE = verticesColors.BYTES_PER_ELEMENT,
            a_Position = gl.getAttribLocation(gl.program, 'a_Position'),
            a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 5, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 5, FSIZE * 3);
        gl.enableVertexAttribArray(a_TexCoord);

    }
    function initTexture(tex) {
        var glTex = gl.createTexture(),
            u_Sampler = gl.getUniformLocation(gl.program, "u_Sampler");
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, glTex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex);
        gl.uniform1i(u_Sampler, 0);
    }
    function initMatrix() {
        var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
        modelMatrix.setRotate(-60, 1, 0, 0);
        viewMatrix.setLookAt(-2.5, 0, 2.5, 0, 0, -2.5, 0, 1, 0);
        projMatrix.setPerspective(45, canvas.width/canvas.height, 1, 1000);
        mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
        gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
        console.log(mvpMatrix.elements);
    }
    function initTime() {
        time = gl.getUniformLocation(gl.program, "time");
        gl.uniform1f(time,2.0);
    }
    function update(curTime) {
        time = gl.getUniformLocation(gl.program, "time");
        gl.uniform1f(time,curTime/10);
    }

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        for(var i = 0; i < numRow; i++){
            gl.drawArrays(gl.TRIANGLE_STRIP, i*pointNumPerRow, pointNumPerRow);
        }

    }
    function loop(time) {
        update(time);
        render();
        requestAnimationFrame(loop);
    }
    function start() {
        alert('fuck');
        initBuffer();
        initTexture(tex);
        initMatrix();
        initTime();
        loop();
    }
})();