/* global Object, module */

const Particles = class Particles {
  constructor(jQuery, $element, options = {}) {
    this.$ = jQuery;
    this.width = options.width || 300;
    this.height = options.height || 100;
    this.spacing = options.spacing || 3;
    this.rows = Math.floor(this.height / this.spacing);
    this.cols = Math.floor(this.width / this.spacing);
    this.numParticles = this.rows * this.cols;
    this.thickness = options.thickness || 80 ** 2;
    this.color = options.color || [0, 0, 0, 255];
    this.drag = options.drag || 0.95;
    this.ease = options.ease || 0.25;
    this.$element = $element;
    this.$mask = this.$('<div class="particle-mask" />').appendTo(
      this.$element,
    );
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d');
    this.$(this.canvas).appendTo(this.$element);
    this.particles = this._initParticles();
    this._attachEvents();

    this.toggle = true;
    this.manual = false;
    this.mx = 0;
    this.my = 0;

    this._step();
  }

  _initParticles() {
    const list = [];
    const particle = {
      vx: 0,
      vy: 0,
      x: 0,
      y: 0,
    };

    for (let i = 0; i < this.numParticles; i++) {
      const point = Object.create(particle);
      point.x = point.ox = this.spacing * (i % this.cols);
      point.y = point.oy = this.spacing * ~~(i / this.cols);
      list.push(point);
    }

    return list;
  }

  _attachEvents() {
    const that = this;
    this.$mask.on('mousemove.particles', e => {
      const bounds = that.$mask[0].getBoundingClientRect();
      that.mx = e.clientX - bounds.left;
      that.my = e.clientY - bounds.top;
      that.manual = true;
    });
  }

  _step() {
    if (this.toggle) {
      if (!this.manual) {
        const t = +new Date() * 0.001;
        this.mx =
          this.width * 0.5 +
          Math.cos(t * 2.1) * Math.cos(t * 0.9) * this.width * 0.45;
        this.my =
          this.height * 0.5 +
          Math.sin(t * 3.2) * Math.tan(Math.sin(t * 0.8)) * this.height * 0.45;
      }

      for (let i = 0; i < this.numParticles; i++) {
        const point = this.particles[i];
        const dx = this.mx - point.x;
        const dy = this.my - point.y;
        const d = dx * dx + dy * dy;
        const f = -this.thickness / d;

        if (d < this.thickness) {
          const t = Math.atan2(dy, dx);
          point.vx += f * Math.cos(t);
          point.vy += f * Math.sin(t);
        }

        point.x += (point.vx *= this.drag) + (point.ox - point.x) * this.ease;
        point.y += (point.vy *= this.drag) + (point.oy - point.y) * this.ease;
      }
    }
    else {
      const imageData = this.ctx.createImageData(this.width, this.height);
      const data = imageData.data;

      for (let i = 0; i < this.numParticles; i++) {
        const point = this.particles[i];
        const n = (~~point.x + ~~point.y * this.width) * 4;
        this.color.forEach((val, index) => {
          data[n + index] = this.color[index];
        });
      }

      this.ctx.putImageData(imageData, 0, 0);
    }

    this.toggle = !this.toggle;
    window.requestAnimationFrame(this._step.bind(this));
  }

  disable() {
    this.$mask.off('mousemove.particles');
    this.$(this.canvas).remove();
  }
};

module.exports = Particles;
