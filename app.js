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

const ongoingTouches = [];

function handleStart(event) {
  event.preventDefault();
  const touches = event.changedTouches;

  for (let i = 0; i < touches.length; i++) {
    //console.log(`touch start: ${i}`);
    ongoingTouches.push(copyTouch(touches[i]));
    const color = colorForTouch(touches[i]);
    let touchCords = getTouchCords(touches[i]);

    context.beginPath();
    context.arc(touchCords.x, touchCords.y, 4, 0, Math.PI * 2, false);

    context.fillStyle = color;
    context.fill();
  }
}

function handleEnd(event) {
  event.preventDefault();

  const touches = event.changedTouches;

  for (let i = 0; i < touches.length; i++) {
    const color = colorForTouch(touches[i]);
    let idx = ongoingTouchIndexById(touches[i].identifier);

    let touchCords = getTouchCords(touches[i]);
    let ongoingTouchCords = getTouchCords(ongoingTouches[idx]);

    if (idx >= 0) {
      context.lineWidth = 4;
      context.fillStyle = color;
      context.beginPath();
      context.moveTo(ongoingTouchCords.x, ongoingTouchCords.y);
      context.lineTo(touchCords.x, touchCords.y);
      context.fillRect(touchCords.x - 4, touchCords.y - 4, 8, 8);

      ongoingTouches.splice(idx, 1);
    }
  }
}

function handleCancel() {}

function handleMove(event) {
  event.preventDefault();

  const touches = event.changedTouches;

  for (let i = 0; i < touches.length; i++) {
    const color = colorForTouch(touches[i]);
    const idx = ongoingTouchIndexById(touches[i].identifier);

    if (idx >= 0) {
      //console.log(`continuing touch: ${idx}`);
      context.beginPath();

      let touchCords = getTouchCords(touches[i]);
      let ongoingTouchCords = getTouchCords(ongoingTouches[idx]);

      context.moveTo(ongoingTouchCords.x, ongoingTouchCords.y);
      context.lineTo(touchCords.x, touchCords.y);
      context.lineWidth = 4;
      context.strokeStyle = color;
      context.stroke();

      ongoingTouches.splice(idx, 1, copyTouch(touches[i]));
    }
  }
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

function colorForTouch(touch) {
  let r = touch.identifier % 16;
  let g = Math.floor(touch.identifier / 3) % 16;
  let b = Math.floor(touch.identifier / 7) % 16;
  r = r.toString(16);
  g = g.toString(16);
  b = b.toString(16);
  const color = `#${r}${g}${b}`;
  return color;
}

function ongoingTouchIndexById(searchId) {
  for (let i = 0; ongoingTouches.length; i++) {
    const id = ongoingTouches[i].identifier;

    if (id === searchId) {
      return i;
    }
  }

  return -1;
}

//---------------------------------------------------------------

function aniamte() {
  requestAnimationFrame(aniamte);

  //context.fillStyle = 'red';
  //context.fillRect(0, 0, CANVAS.width, CANVAS.height);
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
