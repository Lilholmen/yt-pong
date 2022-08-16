const CANVAS = document.querySelector('canvas');
const context = CANVAS.getContext('2d');

CANVAS.width = 800;
CANVAS.height = 450;

//--------------------------------------------------Classes--------------------------------------------------
class Board {
  constructor(position, width, height, color) {
    this.width = width;
    this.height = height;
    this.position = position;
    this.color = color;
  }

  draw() {
    context.fillStyle = this.color;
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  resize(scale) {
    this.position.x *= scale;
    this.position.y *= scale;
    this.width *= scale;
    this.height *= scale;
    if (this.speed) {
      this.speed *= scale;
    }
  }
}

class Paddle extends Board {
  constructor(position, width, height, color) {
    super(position, width, height, color);

    this.speed = 1;

    this.velocity = {
      x: 0,
      y: 0,
    };
  }

  update() {
    this.draw();

    if (
      this.position.y + this.velocity.y > 0 &&
      this.position.y + this.velocity.y < board.height - this.height
    ) {
      this.position.y += this.velocity.y * this.speed;
    }
  }
}

class Ball extends Board {
  constructor(position, width, height, color) {
    super(position, width, height, color);

    this.direction = {
      x: Math.random() > 0.5 ? 1 : -1,
      y: Math.random() > 0.5 ? 1 : -1,
    };
    this.velocity = {
      x: this.direction.x,
      y: this.direction.y,
    };

    this.leftSide = true;
  }

  update() {
    this.draw();

    if (
      this.position.y + this.velocity.y <= 0 ||
      this.position.y + this.velocity.y >= CANVAS.height - this.height
    ) {
      this.velocity.y *= -1;
    }

    if (this.collision(this.leftSide ? paddleLeft : paddleRight, this)) {
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

  collision(paddle, ball) {
    return (
      paddle.position.x + paddle.width >= ball.position.x &&
      paddle.position.x <= ball.position.x + ball.width &&
      paddle.position.y + paddle.height >= ball.position.y &&
      paddle.position.y <= ball.position.y + ball.height
    );
  }
}

//--------------------------------------------------Initialization--------------------------------------------------
const game = {
  isLandscape: false,
  globalScale: 1,
  isPaused: false,
  ballDirection: {
    x: 0,
    y: 0,
  },

  update() {
    board.draw();
    paddleLeft.update();
    paddleRight.update();
    ball.update();
  },

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
  },

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (width < height) {
      this.isLandscape = false;
    } else {
      this.isLandscape = true;
    }

    const widthScale = width / CANVAS.width;

    if (this.isLandscape) {
      const heightScale = height / CANVAS.height;

      this.globalScale = widthScale > heightScale ? heightScale : widthScale;
    } else {
      this.globalScale = widthScale;
    }

    board.resize(this.globalScale);
    paddleLeft.resize(this.globalScale);
    paddleRight.resize(this.globalScale);
    ball.resize(this.globalScale);

    CANVAS.width = board.width;
    CANVAS.height = board.height;
  },
};

const board = new Board({ x: 0, y: 0 }, CANVAS.width, CANVAS.height, 'black');
const paddleLeft = new Paddle({ x: 10, y: 175 }, 10, 100, 'white');
const paddleRight = new Paddle(
  { x: board.width - 10 * 2, y: 175 },
  10,
  100,
  'white'
);
const ball = new Ball(
  { x: board.width / 2, y: board.height / 2 },
  10,
  10,
  'white'
);

game.resize();

const scoreDisplay = {
  left: document.querySelector('.score__left'),
  right: document.querySelector('.score__right'),
};

scoreDisplay.left.textContent = 0;
scoreDisplay.right.textContent = 0;

aniamte();

//--------------------------------------------------Touch screen control--------------------------------------------------
function startup() {
  CANVAS.addEventListener('touchstart', handleStart);
  CANVAS.addEventListener('touchend', handleEnd);
  CANVAS.addEventListener('touchcancel', handleCancel);
  CANVAS.addEventListener('touchmove', handleMove);
}

document.addEventListener('DOMContentLoaded', startup);

const activeTouches = {
  leftSide: null,
  rightSide: null,
};

function handleStart(event) {
  event.preventDefault();

  const touches = event.changedTouches;

  for (let i = 0; i < touches.length; i++) {
    const touchXY = getTouchCords(touches[i]);

    if (touchXY.x < CANVAS.width / 2 && !activeTouches.leftSide) {
      activeTouches.leftSide = copyTouch(touches[i]);
      game.paddleLeft.position.y = paddleStopers(
        touchXY.y - game.paddleLeft.height / 2,
        game.paddleLeft.height
      );
    } else if (!activeTouches.rightSide) {
      activeTouches.rightSide = copyTouch(touches[i]);
      game.paddleRight.position.y = paddleStopers(
        touchXY.y - game.paddleRight.height / 2,
        game.paddleRight.height
      );
    }
  }
}

function handleEnd(event) {
  event.preventDefault();

  const touches = event.changedTouches;

  for (let i = 0; i < touches.length; i++) {
    const touchXY = getTouchCords(touches[i]);

    if (touchXY.x < CANVAS.width / 2) {
      activeTouches.leftSide = null;
    } else {
      activeTouches.rightSide = null;
    }
  }
}

function handleCancel(event) {
  if (event.cancelable) event.preventDefault();

  const touches = event.changedTouches;

  for (let i = 0; i < touches.length; i++) {
    const touchXY = getTouchCords(touches[i]);

    if (touchXY.x < CANVAS.width / 2) {
      activeTouches.leftSide = null;
    } else {
      activeTouches.rightSide = null;
    }
  }
}

function handleMove(event) {
  event.preventDefault();

  const touches = event.changedTouches;

  for (let i = 0; i < touches.length; i++) {
    const touchXY = getTouchCords(touches[i]);

    if (touchXY.x < CANVAS.width / 2) {
      activeTouches.leftSide = copyTouch(touches[i]);
      game.paddleLeft.position.y = paddleStopers(
        touchXY.y - game.paddleLeft.height / 2,
        game.paddleLeft.height
      );
    } else {
      activeTouches.rightSide = copyTouch(touches[i]);
      game.paddleRight.position.y = paddleStopers(
        touchXY.y - game.paddleRight.height / 2,
        game.paddleRight.height
      );
    }
  }
}

function paddleStopers(positionY, paddleH) {
  return positionY < 0
    ? 0
    : positionY > CANVAS.height - paddleH
    ? CANVAS.height - paddleH
    : positionY;
}

function getTouchCords(touch) {
  var rect = CANVAS.getBoundingClientRect(), // abs. size of element
    scaleX = CANVAS.width / rect.width, // relationship bitmap vs. element for x
    scaleY = CANVAS.height / rect.height; // relationship bitmap vs. element for y

  return {
    x: (touch.clientX - rect.left) * scaleX, // scale mouse coordinates after they have
    y: (touch.clientY - rect.top) * scaleY, // been adjusted to be relative to element
  };
}

function copyTouch({ identifier, clientX, clientY }) {
  return { identifier, clientX, clientY };
}

//-----------------------------------------------------------------------------------------------------------------

function aniamte() {
  requestAnimationFrame(aniamte);

  game.update();
}

function movePaddle(paddle, direction) {
  paddle.velocity.y = direction;
}

addEventListener('keydown', (event) => {
  if (!game.isPaused) {
    switch (event.code) {
      case 'Space':
        game.pause();
        break;
      case 'ArrowUp':
        movePaddle(paddleRight, -1);
        break;
      case 'ArrowDown':
        movePaddle(paddleRight, 1);
        break;
      case 'KeyW':
        movePaddle(paddleLeft, -1);
        break;
      case 'KeyS':
        movePaddle(paddleLeft, 1);
        break;
    }
  } else if (event.code === 'Space') {
    game.pause();
  }
});

/* addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'ArrowUp':
    case 'ArrowDown':
      movePaddle(paddleRight, 0);
      break;
    case 'KeyW':
    case 'KeyS':
      movePaddle(paddleLeft, 0);
      break;
  }
}); */

addEventListener('resize', () => {
  game.resize();
});

function log() {
  console.log(CANVAS, board, paddleLeft, paddleRight, ball);
}
