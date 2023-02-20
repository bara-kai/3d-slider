precision lowp float;

varying vec2 vUv;

uniform sampler2D uTexCurrent;
uniform sampler2D uTexNext;
uniform float uProgress;
uniform sampler2D uTexDisp;
float parabola( float x, float k ) {
  return pow( 4. * x * ( 1. - x ), k );
}

void main() {

  vec4 texDisp = texture(uTexDisp, vUv);
  float disp = texDisp.r;
   disp = disp * parabola(uProgress, 1.0);
  vec2 dispUv = vec2(vUv.x + disp, vUv.y );
  vec2 dispUv2 = vec2(vUv.x - disp, vUv.y );

  vec4 texCurrent = texture(uTexCurrent, dispUv);
  vec4 texNext = texture(uTexNext, dispUv2);

  gl_FragColor = mix(texCurrent, texNext, uProgress);
}