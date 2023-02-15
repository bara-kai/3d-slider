// style
import '../stylesheets/style.scss';

import Slider1 from './modules/graphic.js';

document.addEventListener('DOMContentLoaded', function () {
  const main = new Main();
});

class Main {
  constructor() {
    this._init();
  }

  _init() {
    this.sldier1 = new Slider1().init();
  }
}
