import * as THREE from 'three';
import { Mesh, PlaneGeometry } from 'three';
import GUI from 'lil-gui';
import { gsap } from 'gsap';

import vertexShader from '../shader/slider3vert.glsl';
import fragmentShader from '../shader/slider3frag.glsl';

// 画像
import imageurl1 from '../../images/sec3_1.jpg';
import imageurl2 from '../../images/sec3_2.jpg';
import imageurl3 from '../../images/sec3_3.jpg';
import imageurl4 from '../../images/sec3_4.jpg';
// ノイズ

async function slider3() {
  const vert = vertexShader,
    frag = fragmentShader;

  // DOM
  const $slider = document.querySelector('.js-slider3'),
    $inner = $slider.querySelector('.js-slider__inner'),
    $slides = [...$slider.querySelectorAll('.js-slide')];

  // // バレット、ページネーション、インジケーター
  const $bullets = $slider.querySelector('.js-bullets'),
    $indicator = $slider.querySelector('.js-indicator');

  const $bulletsArray = [...$bullets.querySelectorAll('.js-bullet')];
  // // 画像URL
  const imagesUrl = [imageurl1, imageurl2, imageurl3, imageurl4];

  //  画面幅がSLIDE_WIDTHに指定した値以上の場合 meshが拡大表示される
  const SLIDE_WIDTH = 2000;
  // 画面幅がSLIDE_WIDTH以下の場合 余白ができるので高さを指定する
  const SLIDE_MAXHEIGHT = 100;
  // スライドの画像サイズとジオメトリのサイズの調整
  const GEO_ADJ = 0.35;

  $slider.style.maxHeight = `${SLIDE_MAXHEIGHT}vh`;

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
  renderer.setClearColor(0xffffff);

  $inner.appendChild(renderer.domElement);
  // canvasの高さを指定
  $inner.querySelector('canvas').style.height = `${SLIDE_MAXHEIGHT}vh`;

  //ブラウザのリサイズ操作
  window.addEventListener('resize', () => {
    camera.left = -$slider.offsetWidth / 2;
    camera.right = $slider.offsetWidth / 2;
    camera.top = $slider.offsetHeight / 2;
    camera.bottom = -$slider.offsetHeight / 2;

    // if ($slider.offsetWidth > SLIDE_WIDTH) {
    //   material.uniforms.uTexScale.value = $slider.offsetWidth / SLIDE_WIDTH;
    // }
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

  // セットアップジオメトリ
  function setupGeometry() {
    const width = geoSize.w,
      height = geoSize.h,
      wSeg = width / 2,
      hSeg = height / 2;

    const plane = new THREE.PlaneGeometry(width, height, wSeg, hSeg);

    // 対角線上に詰められた遅延時間用の頂点データ
    const intensityVertices = getDiagonalVertices(
      hSeg,
      wSeg,
      () => random(0, 1500),
      0
    );
    //  printMat(delayVertices, wSeg + 1, '遅延時間行列');

    function random(a, b) {
      return a + (b - a) * Math.random();
    }
    window.random = random;

    // 対角線上に頂点を詰めた配列を返す
    function getDiagonalVertices(hSeg, wSeg, getValue, defaultValue) {
      const hSeg1 = hSeg + 1,
        wSeg1 = wSeg + 1;
      let arry = [],
        currentValue = defaultValue;
      for (let i = 0; i < hSeg1 + wSeg1 - 1; i++) {
        for (
          let j = Math.min(hSeg1, i + 1) - 1;
          j >= Math.max(0, i - wSeg1 + 1);
          j--
        ) {
          let currentIndex = j * wSeg1 + i - j;
          currentValue = getValue(currentValue, currentIndex);
          arry[currentIndex] = currentValue;
        }
      }
      return arry;
    }

    // 遅延 delay
    const delayVertices = [];

    const maxCount = (wSeg + 1) * (hSeg + 1);
    for (let i = 0; i < maxCount; i++) {
      // 遅延時間は0~1で格納
      const delayDuration = (1 / maxCount) * i;
      delayVertices.push(delayDuration);
    }

    plane.setAttribute(
      'aDelay',
      new THREE.Float32BufferAttribute(delayVertices, 1)
    );

    plane.setAttribute(
      'aIntensity',
      new THREE.Float32BufferAttribute(intensityVertices, 1)
    );

    return plane;
  }

  const geometry = setupGeometry();
  // const geometry = new THREE.PlaneGeometry(geoSize.w, geoSize.h);

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

  // メッシュ
  // const mesh = new THREE.Mesh(geometry, material);
  // scene.add(mesh);
  // ポイントメッシュ
  const pointMesh = new THREE.Points(geometry, material);
  scene.add(pointMesh);

  let i = 0;
  function animate() {
    requestAnimationFrame(animate);
    let getDeltaTime = clock.getDelta();

    material.uniforms.uTick.value++ * getDeltaTime;
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
        duration: 3.0,
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
  //　ファーストアニメ−ションの開始
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

  // folder1
  //   .add(material.uniforms.uProgress, 'value', 0, 1.0, 0.1)
  //   .name('Progaress');
}

export default slider3;
