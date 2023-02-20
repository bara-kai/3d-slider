precision lowp float;

varying vec2 vUv;
varying float vProgress;


uniform sampler2D uTexCurrent;
uniform sampler2D uTexNext;
uniform float uProgress;


void main() {

  if(vProgress > 0.1 && distance(gl_PointCoord, vec2(0.5, 0.5)) > 0.5) {
    discard;
  }

  vec4 texCurrent = texture(uTexCurrent, vUv);
  vec4 texNext = texture(uTexNext, vUv);

  gl_FragColor = mix(texCurrent, texNext, uProgress);
}