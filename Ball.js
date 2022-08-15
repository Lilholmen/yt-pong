export default class Ball {
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

  draw(context) {
    context.fillStyle = 'white';
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update(context) {
    this.draw(context);

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

  resize(scale) {
    this.position.x *= scale;
    this.position.y *= scale;
    this.width *= scale;
    this.height *= scale;
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
