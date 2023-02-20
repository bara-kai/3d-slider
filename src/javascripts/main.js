import * as THREE from 'three';
import { Mesh, PlaneGeometry } from 'three';
import GUI from 'lil-gui';
import { gsap } from 'gsap';

import vertexShader from './shader/vertex.glsl';
import fragmentShader from './shader/fragment.glsl';

import imageurl1 from '../images/sec1_1.jpg';
import imageurl2 from '../images/sec1_2.jpg';
import imageurl3 from '../images/sec1_3.jpg';
import imageurl4 from '../images/sec1_4.jpg';

import slider2 from './modules/slider2.js';
import slider3 from './modules/slider3.js';

// style
import '../stylesheets/style.scss';

slider1();
slider2();
slider3();

async function slider1() {
  const vert = vertexShader,
    frag = fragmentShader;

  // DOM
  const $slider = document.querySelector('.js-slider'),
    $inner = $slider.querySelector('.js-slider__inner'),
    $slides = [...$slider.querySelectorAll('.js-slide')];

  // // バレット、ページネーション、インジケーター
  const $bullets = $slider.querySelector('.js-bullets'),
    $indicator = $slider.querySelector('.js-indicator');

  const $bulletsArray = [...$bullets.querySelectorAll('.js-bullet')];
  // // 画像URL
  const imagesUrl = [imageurl1, imageurl2, imageurl3, imageurl4];

  //  画面幅がSLIDE_WIDTHに指定した値以上の場合 meshが拡大表示される
  const SLIDE_WIDTH = 500;
  // 画面幅がSLIDE_WIDTH以下の場合 余白ができるので高さを指定する
  const SLIDE_MAXHEIGHT = 650;
  // スライドの画像サイズとジオメトリのサイズの調整
  const GEO_ADJ = 0.8;

  $slider.style.maxHeight = `${SLIDE_MAXHEIGHT}px`;

  // カメラ
  const camera = new THREE.OrthographicCamera(
    $slider.offsetWidth / -2,
    $slider.offsetWidth / 2,
    $slider.offsetHeight / 2,
    $slider.offsetHeight / -2,
    1,
    1000
  );

  camera.position.z = 100;

  // シーン
  const scene = new THREE.Scene();

  // クロック
  const clock = new THREE.Clock();

  // レンダー
  const renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize($slider.offsetWidth, $slider.offsetHeight);

  $inner.appendChild(renderer.domElement);

  //ブラウザのリサイズ操作
  window.addEventListener('resize', () => {
    camera.left = -$slider.offsetWidth / 2;
    camera.right = $slider.offsetWidth / 2;
    camera.top = $slider.offsetHeight / 2;
    camera.bottom = -$slider.offsetHeight / 2;

    if ($slider.offsetWidth > SLIDE_WIDTH) {
      material.uniforms.uTexScale.value = $slider.offsetWidth / SLIDE_WIDTH;
    }
    camera.updateProjectionMatrix();

    renderer.setSize($slider.offsetWidth, $slider.offsetHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
  });

  // テクスチャのロード
  async function loadTex(url) {
    const texLoader = new THREE.TextureLoader();

    const textures = [];

    for (const imageUrl of imagesUrl) {
      const texture = await texLoader.loadAsync(imageUrl);

      texture.needsUpdate = true;

      const imageAspect = new Float32Array([
        1.0,
        texture.image.height / texture.image.width,
      ]);

      textures.push({
        tex: texture,
        asp: imageAspect,
      });
    }

    return textures;
  }

  // テクスチャの配列
  const textures = await loadTex();

  // ジオメトリ
  // shaderよりアスペクト比を指定しているため、w,hは共通の値を入れておく
  const geoSize = {
    w: SLIDE_WIDTH * GEO_ADJ,
    h: SLIDE_WIDTH * GEO_ADJ,
  };

  const geometry = new THREE.PlaneGeometry(geoSize.w, geoSize.h);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTexCurrent: { value: textures[0].tex },
      uTexNext: { value: textures[1].tex },
      uTexCurrentAsp: { value: textures[0].asp },
      uTexNextAsp: { value: textures[1].asp },
      uTick: { value: 0 },
      uProgress: { value: 0 },
      uTexScale: { value: 1.0 },
    },
    vertexShader: vert,
    fragmentShader: frag,
  });
  if ($slider.offsetWidth > SLIDE_WIDTH) {
    material.uniforms.uTexScale.value = $slider.offsetWidth / SLIDE_WIDTH;
  }

  const mesh = new THREE.Mesh(geometry, material);

  scene.add(mesh);

  let i = 0;
  function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
  }

  animate();

  // スライドのセット
  let imageIndex = { current: 0, next: 1 };
  const imagelength = imagesUrl.length;

  // カレント、ネクストイメージのindexセット
  function nextImage() {
    if (imageIndex.next < imagelength - 1) {
      imageIndex.current = imageIndex.next;
      imageIndex.next = imageIndex.next + 1;
    } else {
      imageIndex.current = imageIndex.next;
      imageIndex.next = 0;
    }
  }

  // スライドディレイ、アニメーションステート、タイマー
  const slideDelayTime = 3000;
  let animationState = false;
  let timer;

  // スライドアニメーション
  function slideAnimation() {
    if (!animationState) {
      animationState = true;
      clearTimeout(timer);

      material.uniforms.uTexCurrentAsp.value = textures[imageIndex.current].asp;
      material.uniforms.uTexNextAsp.value = textures[imageIndex.next].asp;
      material.uniforms.uTexCurrent.value = textures[imageIndex.current].tex;
      material.uniforms.uTexNext.value = textures[imageIndex.next].tex;
      gsap.to(material.uniforms.uProgress, {
        duration: 0.5,
        value: 1,
        ease: 'Expo.easeInoOut',
        onComplete: () => {
          material.uniforms.uTexCurrent.value = textures[imageIndex.next].tex;
          material.uniforms.uTexCurrentAsp.value =
            textures[imageIndex.next].asp;
          material.uniforms.uProgress.value = 0;
          imageIndex.current = imageIndex.next;
          animationState = false;

          timer = setTimeout(() => {
            nextImage();
            slideAnimation();
          }, slideDelayTime);
        },
      });
    }
  }

  // ファーストアニメーション
  const fristAnimation = () => {
    timer = setTimeout(() => {
      slideAnimation();
    }, slideDelayTime);
  };
  fristAnimation();

  $bulletsArray.forEach((bullet) => {
    bullet.addEventListener('click', () => {
      let bulletIndex = parseInt(bullet.dataset.slide, 10);

      clearTimeout(timer);
      timer = setTimeout(slideAnimation, slideDelayTime);
      if (bulletIndex !== imageIndex.current) {
        imageIndex.next = bulletIndex;
        slideAnimation();
      }
    });
  });

  // dat gui
  // const gui = new GUI();
  // const folder1 = gui.addFolder('uniforms');
  // folder1.open();

  // folder1.add(material.uniforms.uTexScale, 'value', 0, 2.0, 0.1).name('Scale');
}
