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

// style
import '../stylesheets/style.scss';
import { first } from 'lodash';

init();

async function init() {
  const vert = vertexShader,
    frag = fragmentShader;

  // DOM
  const $slider = document.querySelector('.js-slider'),
    $inner = $slider.querySelector('.js-slider__inner'),
    $slides = [...$slider.querySelectorAll('.js-slide')];

  // // バレット、ページネーション、インジケーター
  const $bullets = document.querySelector('.js-bullets'),
    $paginations = document.querySelector('.js-paginations '),
    $indicator = document.querySelector('.js-indicator');

  const $bulletsArray = [...$bullets.querySelectorAll('.js-bullet')],
    $paginationsLeft = $paginations.querySelector('.js-paginations-arrow-left'),
    $paginationsRight = $paginations.querySelector(
      '.js-paginations-arrow-right'
    );
  // // 画像URL
  const imagesUrl = [imageurl1, imageurl2, imageurl3, imageurl4];

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

  // テクスチャのロード
  async function loadTex(url) {
    const texLoader = new THREE.TextureLoader();

    const textures = [];

    for (const imageUrl of imagesUrl) {
      const texture = await texLoader.loadAsync(imageUrl);
      textures.push(texture);
    }

    return textures;
  }

  // テクスチャの配列
  const textures = await loadTex();

  // ジオメトリ
  const geometry = new THREE.PlaneGeometry(
    $slider.offsetWidth,
    $slider.offsetHeight
  );

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTexCurrent: { value: textures[0] },
      uTexNext: { value: textures[1] },
      uTick: { value: 0 },
      uProgress: { value: 0 },
    },
    vertexShader: vert,
    fragmentShader: frag,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // dat gui
  // const gui = new GUI();
  // const folder1 = gui.addFolder('progress');
  // folder1.open();

  // folder1.add(material.uniforms.uProgress, 'value', 0, 1, 0.1).name('progess');

  let i = 0;
  function animate() {
    requestAnimationFrame(animate);

    // material.uniforms.uTick.value++;
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

  // スライドディレイ、アニメーションステート
  const slideDelayTime = 3000;
  let animationState = false;

  // スライドアニメーション
  function slideAnimation() {
    if (!animationState) {
      animationState = true;

      material.uniforms.uTexCurrent.value = textures[imageIndex.current];
      material.uniforms.uTexNext.value = textures[imageIndex.next];
      gsap.to(material.uniforms.uProgress, {
        duration: 1.0,
        value: 1,
        ease: 'Expo.easeInoOut',
        onComplete: () => {
          console.log(imageIndex);
          material.uniforms.uTexCurrent.value = textures[imageIndex.next];
          material.uniforms.uProgress.value = 0;
          animationState = false;
          setTimeout(() => {
            nextImage();
            slideAnimation();
          }, slideDelayTime);
        },
      });
    }
  }

  // ファーストアニメーション
  const fristAnimation = () => {
    setTimeout(() => {
      slideAnimation();
    }, slideDelayTime);
  };
  fristAnimation();

  const arrows = [];
  arrows.push($paginationsLeft);
  arrows.push($paginationsRight);

  arrows.forEach((arrow) => {
    arrow.addEventListener('click', () => {
      // slideAnimation();
    });
  });

  function bulletAnimation() {
    if (!animationState) {
      animationState = true;

      material.uniforms.uTexCurrent.value = textures[imageIndex.current];
      material.uniforms.uTexNext.value = textures[imageIndex.next];
      gsap.to(material.uniforms.uProgress, {
        duration: 1.0,
        value: 1,
        ease: 'Expo.easeInoOut',
        onComplete: () => {
          console.log(imageIndex);
          material.uniforms.uTexCurrent.value = textures[imageIndex.next];
          material.uniforms.uProgress.value = 0;
          animationState = false;
          setTimeout(() => {
            nextImage();
            slideAnimation();
          }, slideDelayTime);
        },
      });
    }
  }

  console.log(imageIndex);
  $bulletsArray.forEach((bullet) => {
    bullet.addEventListener('click', () => {
      let bulletIndex = parseInt(bullet.dataset.slide, 10);
      imageIndex.next = bulletIndex;
      console.log(imageIndex);
      bulletAnimation();
    });
  });
}
