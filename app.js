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
  console.log(touches[0]);

  for (let i = 0; i < touches.length; i++) {
    //console.log(`touch start: ${i}`);
    ongoingTouches.push(copyTouch(touches[i]));
    const color = colorForTouch(touches[i]);

    context.beginPath();
    context.arc(touches[i].pageX, touches[i].pageY, 4, 0, Math.PI * 2, false);

    context.fillStyle = color;
    context.fill();
  }
}

function handleEnd() {}

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
      context.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
      context.lineTo(touches[i].pageX, touches[i].pageY);
      context.lineWidth = 4;
      context.strokeStyle = color;
      context.stroke();

      ongoingTouches.splice(idx, 1, copyTouch(touches[i]));
    }
  }
}

function copyTouch({ identifier, pageX, pageY }) {
  return { identifier, pageX, pageY };
}

function colorForTouch(touch) {
  let r = touch.identifier + (10 % 16);
  let g = Math.floor(touch.identifier + 10 / 3) % 16;
  let b = Math.floor(touch.identifier + 10 / 7) % 16;
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

addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'ArrowUp':
      paddleRight.velocity.y = -1;
      break;
    case 'ArrowDown':
      paddleRight.velocity.y = 1;
      break;
    case 'KeyW':
      paddleLeft.velocity.y = -1;
      break;
    case 'KeyS':
      paddleLeft.velocity.y = 1;
      break;
  }
});

addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'ArrowUp':
    case 'ArrowDown':
      paddleRight.velocity.y = 0;
      break;
    case 'KeyW':
    case 'KeyS':
      paddleLeft.velocity.y = 0;
      break;
  }
});
