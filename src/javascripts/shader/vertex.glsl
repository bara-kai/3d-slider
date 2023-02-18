precision lowp float;

varying vec2 vUv;
uniform vec2 uTexCurrentAsp;
uniform vec2 uTexNextAsp;
uniform float uProgress;


void main() {
    vUv = uv;
    float intensity = 1.5;

    vec2 aspect = mix(uTexCurrentAsp, uTexNextAsp, uProgress);
vec3 pos = vec3(position.x * aspect.x * intensity, position.y * aspect.y * intensity, position.z);

vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
gl_Position = projectionMatrix * mvPosition;

}