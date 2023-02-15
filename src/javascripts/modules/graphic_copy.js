import * as THREE from 'three';
import { Mesh, PlaneGeometry } from 'three';
import GUI from 'lil-gui';

import vertexShader from '../shader/vertex.glsl';
import fragmentShader from '../shader/fragment.glsl';

import imageurl1 from '../../images/sec1_1.jpg';
import imageurl2 from '../../images/sec1_2.jpg';
import imageurl3 from '../../images/sec1_3.jpg';
import imageurl4 from '../../images/sec1_4.jpg';

class Slider1 {
  constructor() {
    this.bindAll();

    this.vert = vertexShader;
    this.frag = fragmentShader;

    // DOM
    this.$slider = document.querySelector('.js-slider');
    this.$inner = this.$slider.querySelector('.js-slider__inner');
    this.$slides = [...this.$slider.querySelectorAll('.js-slide')];

    // バレット、ページネーション、インジケーター
    this.$bullets = document.querySelector('.js-bullets');
    this.$paginations = document.querySelector('.js-paginations ');
    this.$indicator = document.querySelector('.js-indicator');
    window.bullets = this.$bullets;

    this.$bulletsArray = [...this.$bullets.querySelectorAll('.js-bullet')];
    this.$paginationsLeft = [
      ...this.$paginations.querySelectorAll('.js-paginations-arrow-left'),
    ];
    this.$paginationsRight = [
      ...this.$paginations.querySelectorAll('.js-paginations-arrow-right'),
    ];

    // 画像URL
    this.imagesUrl = [imageurl1, imageurl2, imageurl3, imageurl4];
  }

  bindAll() {
    // 関数として使用するものをバインドする
    ['render', 'animate'].forEach((fn) => (this[fn] = this[fn].bind(this)));
  }

  // カメラ
  cameraSetup() {
    this.camera = new THREE.OrthographicCamera(
      this.$slider.offsetWidth / -2,
      this.$slider.offsetWidth / 2,
      this.$slider.offsetHeight / 2,
      this.$slider.offsetHeight / -2,
      1,
      1000
    );

    // this.camera = new THREE.PerspectiveCamera(
    //   75,
    //   this.$slider.offsetWidth / this.$slider.offsetHeight,
    //   0.1,
    //   1000
    // );

    // this.camera.lookAt(this.scene.position);
    this.camera.position.z = 100;
  }

  // シーン、クロック、レンダー
  setup() {
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock(true);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.$slider.offsetWidth, this.$slider.offsetHeight);

    this.$inner.appendChild(this.renderer.domElement);
  }

  // テスクチャ
  async loadTextures() {
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = '';

    this.textures = [];

    for (const imageUrl of this.imagesUrl) {
      const texture = await loader.loadAsync(imageUrl, this.render);

      this.textures.push(texture);
    }

    //　テスクチャの読み込みが完了後開始
    this.createMesh();
  }

  async createMesh() {
    // ジオメトリ
    this.geometory = new THREE.PlaneGeometry(
      this.$slider.offsetWidth / 2,
      this.$slider.offsetHeight / 2
    );

    // テクスチャ
    // this.texLoader = new THREE.TextureLoader();
    // this.texture = await this.texLoader.loadAsync(imageurl1, this.render);

    // マテリアル
    // this.material = new THREE.MeshBasicMaterial({ map: this.texture });
    // this.material = new THREE.MeshBasicMaterial({ map: this.textures[0] });

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTexCurrent: { type: 't', value: await this.textures[1] },
        uTexNext: { type: 't', value: await this.textures[3] },
        uTick: { value: 0 },
        uProgress: { value: 0 },
      },
      vertexShader: this.vert,
      fragmentShader: this.frag,
    });

    this.mesh = new THREE.Mesh(this.geometory, this.material);

    this.scene.add(this.mesh);

    this.folder
      .add(this.material.uniforms.uProgress, 'value', 0, 1, 0.1)
      .name('uProgress');
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.render();
  }

  gui() {
    // lil gui
    const gui = new GUI();

    // フォルダー作成
    const folder1 = gui.addFolder('gui');

    folder1.open();

    console.log(this.material);

    // 数値の設定 （uniformValue, 'value', 最小値, 最大値, ステップ値）
    // folder1
    //   .add(this.material.uniforms.uProgress.value, 'x', 0, 1, 0.1)
    //   .name('uProgress');
    return folder1;
  }

  init() {
    this.setup();
    this.cameraSetup();
    this.loadTextures();
    this.animate();
    this.folder = this.gui();
  }
}

export default Slider1;
