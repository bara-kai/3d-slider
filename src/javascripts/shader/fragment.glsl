precision lowp float;

varying vec2 vUv;

uniform sampler2D uTexCurrent;
uniform sampler2D uTexNext;
uniform float uProgress;

void main() {

  vec2 uv = vUv;
  vec4 _currentImage;
  vec4 _nextImage;
  float intensity = 2.0;

  vec4 orig1 = texture2D(uTexCurrent, uv);
  vec4 orig2 = texture2D(uTexNext, uv);


  _currentImage = texture2D(uTexCurrent, vec2(uv.x - uProgress * (orig2.x * intensity), uv.y));

  _nextImage = texture2D(uTexNext, vec2(uv.x  - (1.0 - uProgress) * (orig1.x * intensity), uv.y));



  vec4 finalTexture = mix(_currentImage, _nextImage, uProgress);

  
  gl_FragColor =finalTexture;

}