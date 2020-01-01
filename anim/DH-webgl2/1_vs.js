#version 300 es

    in vec4 aPos;
    out vec4 oPos;
    out vec4 vColor;

    uniform float time;
    uniform vec2 resolution;
    uniform float radius;
    uniform float lift1;
    uniform float lift2;

    vec2 hash22(vec2 p){
        p = vec2( dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));
        return -1.0 + 2.0 * fract(sin(p)*43758.5453123);
    }

    float perlin_noise(vec2 p){
        vec2 pi = floor(p);
        vec2 pf = p - pi;
        vec2 w = pf * pf * (3.0 - 2.0 * pf);
        return mix(mix(dot(hash22(pi + vec2(0.0, 0.0)), pf - vec2(0.0, 0.0)),
                        dot(hash22(pi + vec2(1.0, 0.0)), pf - vec2(1.0, 0.0)), w.x),
                    mix(dot(hash22(pi + vec2(0.0, 1.0)), pf - vec2(0.0, 1.0)),
                        dot(hash22(pi + vec2(1.0, 1.0)), pf - vec2(1.0, 1.0)), w.x),
                    w.y);
    }

    float noise_sum(vec2 p){
        float f = 0.0;
        p = p * 8.0;
        f += 1.0000 * perlin_noise(p); p = 2.0 * p;
        f += 0.5000 * perlin_noise(p); p = 2.0 * p;
        f += 0.2500 * perlin_noise(p); p = 2.0 * p;
        f += 0.1250 * perlin_noise(p); p = 2.0 * p;
        f += 0.0625 * perlin_noise(p); p = 2.0 * p;
        return f;
    }

    vec2 ro(vec2 co, float deg){return vec2(co.x*cos(deg) - co.y*sin(deg), co.x*sin(deg) + co.y*cos(deg));}

    float rand(vec2 co){return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);}
    
    void main(){
        float restTime = aPos.z;
        restTime -= 0.1;
        vec2 pos = vec2(aPos.x, aPos.y);
        if(restTime < 0.0){
            restTime = lift1 + lift2;
            float deg = aPos.w;
            oPos = vec4(radius * sin(deg), radius * cos(deg), restTime, aPos.w);
        }else if(restTime > lift2){
            oPos = vec4(aPos.x, aPos.y, restTime, aPos.w);
        }else{
            float noise = noise_sum(vec2(aPos.x/resolution.x*2.0 + time/80.0, aPos.y/resolution.y*2.0 + time/80.0));
            float noiseDeg = (2.0 * noise - 1.0)*1.57;
            vec2 xxSpeed = vec2(-pos.x/resolution.x*2.0, -pos.y/resolution.y*2.0);
            xxSpeed = vec2(xxSpeed.x*cos(noiseDeg) - xxSpeed.y*sin(noiseDeg), xxSpeed.x*sin(noiseDeg) + xxSpeed.y*cos(noiseDeg));
            xxSpeed = xxSpeed/length(xxSpeed)/9000.0;
            oPos = vec4((pos.x + xxSpeed.x*resolution.x*2.0), aPos.y + xxSpeed.y*resolution.y*2.0, restTime, aPos.w);

        }

        if(restTime < 15.0){
            vColor = vec4(0.0, 0.752, 0.984, restTime/15.0);
        }else{
            vColor = vec4(0.0, 0.752, 0.984, 1.0);
        }

        pos = ro(pos, time/100.0);

        gl_Position = vec4(pos.x/resolution.x*2.0, pos.y/resolution.y*2.0, 0.0, 1.0);
        gl_PointSize = 1.0;
    }
