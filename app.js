const CANVAS = document.querySelector('canvas');
const context = CANVAS.getContext('2d');

const screenSize = {
  w: window.innerWidth,
  h: window.innerHeight,
};

class GameField {
  constructor({ browserW, browserH }) {
    this.browserW = browserW;
    this.browserH = browserH;
    this.width = 800;
    this.height = 450;
    this.isLandscape = this.browserW > this.browserH;
    this.globalScale = 1;

    if (this.isLandscape) {
      let wScale = browserW / this.width;
      let hScale = browserH / this.height;

      this.globalScale = wScale > hScale ? hScale : wScale;
    } else {
      this.globalScale = browserW / this.width;
    }

    if (this.globalScale !== 1) {
      this.width *= this.globalScale;
      this.height *= this.globalScale;
    }
  }
}

const game = new GameField({ browserW: screenSize.w, browserH: screenSize.h });

CANVAS.width = game.width;
CANVAS.height = game.height;

class Paddle {
  constructor({ position, scale = 1 }) {
    this.position = position;
    this.scale = scale;
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.width = 10 * this.scale;
    this.height = 100 * this.scale;

    this.speed = 5 * this.scale;
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
  constructor({ position, scale = 1 }) {
    this.position = position;
    this.scale = scale;
    this.direction = {
      x: Math.random() > 0.5 ? 1 : -1,
      y: Math.random() > 0.5 ? 1 : -1,
    };
    this.velocity = {
      x: this.direction.x * this.scale * 3,
      y: this.direction.y * this.scale * 3,
    };
    this.width = 10 * this.scale;
    this.height = 10 * this.scale;
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
  scale: game.globalScale,
});

const paddleRight = new Paddle({
  position: {
    x: CANVAS.width - 10 * 2,
    y: 100,
  },
  scale: game.globalScale,
});

const ball = new Ball({
  position: {
    x: CANVAS.width / 2,
    y: CANVAS.height / 2,
  },
  scale: game.globalScale,
});

aniamte();

//-------------------------Touch screen control------------------
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
      paddleLeft.position.y = paddleStopers(
        touchXY.y - paddleLeft.height / 2,
        paddleLeft.height
      );
    } else if (!activeTouches.rightSide) {
      activeTouches.rightSide = copyTouch(touches[i]);
      paddleRight.position.y = paddleStopers(
        touchXY.y - paddleRight.height / 2,
        paddleRight.height
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
      paddleLeft.position.y = paddleStopers(
        touchXY.y - paddleLeft.height / 2,
        paddleLeft.height
      );
    } else {
      activeTouches.rightSide = copyTouch(touches[i]);
      paddleRight.position.y = paddleStopers(
        touchXY.y - paddleRight.height / 2,
        paddleRight.height
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

//---------------------------------------------------------------

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

function movePaddle(paddle, direction) {
  paddle.velocity.y = direction;
}

addEventListener('keydown', (event) => {
  switch (event.code) {
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
});

addEventListener('keyup', (event) => {
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
});
