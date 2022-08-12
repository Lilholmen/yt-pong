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

aniamte();

//-------------------------Touch screen control------------------
function startup() {
  CANVAS.addEventListener('touchstart', handleStart);
  CANVAS.addEventListener('touchend', handleEnd);
  CANVAS.addEventListener('touchcancel', handleCancel);
  CANVAS.addEventListener('touchmove', handleMove);
  console.log('Initialized.');
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
