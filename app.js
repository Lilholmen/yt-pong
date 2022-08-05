const CANVAS = document.querySelector('canvas');
const context = CANVAS.getContext('2d');

CANVAS.width = 700;
CANVAS.height = 360;

class Paddle {
  constructor({ position }) {
    this.position = position;
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.width = 10;
    this.height = 100;

    this.speed = 3;
  }

  draw() {
    context.fillStyle = 'white';
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();

    if (
      this.position.y + this.velocity.y > 0 &&
      this.position.y + this.velocity.y < CANVAS.height - this.height
    ) {
      this.position.y += this.velocity.y * this.speed;
    }
  }
}

class Ball {
  constructor({ position }) {
    this.position = position;
    this.direction = {
      x: Math.random() > 0.5 ? 1 : -1,
      y: Math.random() > 0.5 ? 1 : -1,
    };
    this.velocity = {
      x: this.direction.x,
      y: this.direction.y,
    };
    this.width = 10;
    this.height = 10;
    this.leftSide = true;
  }

  draw() {
    context.fillStyle = 'white';
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();

    if (
      this.position.y + this.velocity.y <= 0 ||
      this.position.y + this.velocity.y >= CANVAS.height - this.height
    ) {
      this.velocity.y *= -1;
    }

    if (collision(this.leftSide ? paddleLeft : paddleRight, this)) {
      this.velocity.x *= -1;
    }

    if (
      this.position.x + this.velocity.x <= 0 ||
      this.position.x + this.velocity.x >= CANVAS.width - this.width
    ) {
      if (this.velocity.x < 0) {
        scoreDisplay.right.textContent++;
      } else scoreDisplay.left.textContent++;

      this.velocity.x *= -1;
    }

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.x > CANVAS.width / 2) {
      this.leftSide = false;
    } else {
      this.leftSide = true;
    }
  }
}

const scoreDisplay = {
  left: document.querySelector('.score__left'),
  right: document.querySelector('.score__right'),
};

scoreDisplay.left.textContent = 0;
scoreDisplay.right.textContent = 0;

const paddleLeft = new Paddle({
  position: {
    x: 10,
    y: 100,
  },
});

const paddleRight = new Paddle({
  position: {
    x: CANVAS.width - 10 * 2,
    y: 100,
  },
});

const ball = new Ball({
  position: {
    x: CANVAS.width / 2,
    y: CANVAS.height / 2,
  },
});

addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowUp':
      paddleRight.velocity.y = -1;
      break;
    case 'ArrowDown':
      paddleRight.velocity.y = 1;
      break;
    case 'w':
      paddleLeft.velocity.y = -1;
      break;
    case 's':
      paddleLeft.velocity.y = 1;
      break;
  }
});

addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'ArrowUp':
    case 'ArrowDown':
      paddleRight.velocity.y = 0;
      break;
    case 'w':
    case 's':
      paddleLeft.velocity.y = 0;
      break;
  }
});

aniamte();

function aniamte() {
  requestAnimationFrame(aniamte);

  context.fillStyle = 'black';
  context.fillRect(0, 0, CANVAS.width, CANVAS.height);
  paddleLeft.update();
  paddleRight.update();
  ball.update();
}

function collision(paddle, ball) {
  return (
    paddle.position.x + paddle.width >= ball.position.x &&
    paddle.position.x <= ball.position.x + ball.width &&
    paddle.position.y + paddle.height >= ball.position.y &&
    paddle.position.y <= ball.position.y + ball.height
  );
}
