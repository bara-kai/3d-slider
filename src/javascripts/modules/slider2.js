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

class Slider {
  constructor() {
    this.vert = vertexShader;
    this.frag = fragmentShader;
    this.$slider = document.querySelector('.js-slider');
    this.$inner = this.$slider.querySelector('.js-slider__inner');
    this.$slides = [...this.$slider.querySelectorAll('.js-slide')];
    this.$bullets = document.querySelector('.js-bullets');
    this.$indicator = document.querySelector('.js-indicator');
    this.$bulletsArray = [...this.$bullets.querySelectorAll('.js-bullet')];
    this.imagesUrl = [imageurl1, imageurl2, imageurl3, imageurl4];
    this.SLIDE_WIDTH = 1000;
    this.SLIDE_MAXHEIGHT = 650;
    this.GEO_ADJ = 0.68;

    this.camera = new THREE.OrthographicCamera(
      this.$slider.offsetWidth / -2,
      this.$slider.offsetWidth / 2,
      this.$slider.offsetHeight / 2,
      this.$slider.offsetHeight / -2,
      1,
      1000
    );

    this.camera.position.z = 100;
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.$slider.offsetWidth, this.$slider.offsetHeight);
    this.$inner.appendChild(this.renderer.domElement);
    this.$slider.style.maxHeight = `${this.SLIDE_MAXHEIGHT}px`;
    this.geometry = new THREE.PlaneGeometry(this.SLIDE_WIDTH * this.GEO_ADJ, this.SLIDE_WIDTH * this.GEO_ADJ);
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTexCurrent: { value: null },
        uTexNext: { value: null },
        uTexCurrentAsp: { value: null },
        uTexNextAsp: { value: null },
        uTick: { value: 0 },
        uProgress: { value: 0 },
        uTexScale: { value: 1.0 },
      },
      vertexShader: this.vert,
      fragmentShader: this.frag,
    });

    if (this.$slider.offsetWidth > this.SLIDE_WIDTH) {
      this.material.uniforms.uTexScale.value = this.$slider.offsetWidth / this.SLIDE_WIDTH;
    }

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
    this.imageIndex = { current: 0, next: 1 };
    this.textures = [];
    this.imagelength = this.imagesUrl.length;
    this.isAnimating = false;

    window.addEventListener('resize', () => {
      this.camera.left = -this.$slider.offsetWidth / 2;
      this.camera.right = this.$slider.offsetWidth / 2;
      this.camera.top = this.$slider.offsetHeight / 2;
      this.camera.bottom = -this.$slider.offsetHeight / 2;

      if (this.$slider.offsetWidth > this.SLIDE_WIDTH) {
        this.material.uniforms.u
