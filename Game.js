import Paddle from './Paddle.js';
import Ball from './Ball.js';

export default class Game {
  constructor({ w, h }) {
    this.width = w;
    this.height = h;
    this.isLandscape = false;
    this.globalScale = 1;
    this.isPaused = false;

    this.paddleLeft = new Paddle({
      position: {
        x: 10,
        y: 350,
      },
    });
    this.paddleRight = new Paddle({
      position: {
        x: this.width - 10 * 2,
        y: 350,
      },
    });
    this.ball = new Ball({
      position: {
        x: this.width / 2,
        y: this.height / 2,
      },
    });

    this.ballDirection = {
      x: 1,
      y: 1,
    };
  }

  resize({ width = 800, height = 450 }, canvas) {
    this.isLandscape = width > height;

    if (this.isLandscape) {
      let wScale = width / this.width;
      let hScale = height / this.height;

      this.globalScale = wScale > hScale ? hScale : wScale;
    } else {
      this.globalScale = width / this.width;
    }

    if (this.globalScale !== 1) {
      this.width *= this.globalScale;
      this.height *= this.globalScale;
    }

    canvas.width = this.width;
    canvas.height = this.height;
  }

  pause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.ballDirection = ball.velocity;

      ball.velocity = {
        x: 0,
        y: 0,
      };
    } else {
      ball.velocity = this.ballDirection;
    }
  }
}
