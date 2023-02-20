precision lowp float;

#pragma glslify: ease = require(glsl-easings/exponential-out)
#pragma glslify: noise2 = require(glsl-noise/simplex/2d)
#pragma glslify: noise3 = require(glsl-noise/simplex/3d)
#pragma glslify: snoise = require(glsl-noise/simplex/3d)


attribute float aIntensity;
attribute float aDelay;


varying vec2 vUv;
varying float vProgress;

uniform vec2 uTexCurrentAsp;
uniform vec2 uTexNextAsp;
uniform float uProgress;
uniform float uTexScale;
uniform float uTick;


void main() {
    vUv = uv;
    float intensity = 1.5 * uTexScale;
    float progress = vProgress  = 1. - abs(2. * uProgress - 1.);
    vec2 noiseScale = vec2(1.0, 1.0);

      // ヨコシマのノイズ
//    float n = noise3(vec3(vUv.x * noiseScale.x, vUv.y * noiseScale.y, uTick ));

     // 波のように揺れる
//  float n = noise2(vec2(vUv.x * 100. - sin(vUv.y + uTick / 100.), vUv.y * 10. - sin(vUv.x + uTick / 100.)));

  // 模様を変化させる
    float n = noise3(vec3(vUv * 10., uTick * 0.01));
    float sn = snoise(vec3(position.xy, uTick * 0.01)) * 0.5 + 0.5;

    
    float speed = ease(progress);
    vec3 pos = position;

    vec2 xyDirection = (uv - 0.5) * 2.0;
    float xyIntensity = 2000.;


    vec2 aspect = mix(uTexCurrentAsp, uTexNextAsp, uProgress);
    pos.xy *= aspect.xy * intensity;
    pos.y += xyDirection.y * sn * aIntensity  * progress * speed * sn;
    pos.x += xyDirection.x * sn * progress * speed * aIntensity * n;





vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
gl_PointSize = 7.0;
gl_Position = projectionMatrix * mvPosition;

}