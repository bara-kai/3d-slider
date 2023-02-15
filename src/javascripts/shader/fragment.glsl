precision lowp float;

varying vec2 vUv;

uniform sampler2D uTexCurrent;
uniform sampler2D uTexNext;
uniform float uProgress;

void main() {

  vec4 texCurrent = texture(uTexCurrent, vUv);
  vec4 texNext = texture(uTexNext, vUv);
  vec4 color = mix(texCurrent, texNext, uProgress);
  gl_FragColor = color;

}