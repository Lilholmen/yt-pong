export default class Paddle {
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

  draw(context) {
    context.fillStyle = 'white';
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update(context) {
    this.draw(context);

    if (
      this.position.y + this.velocity.y > 0 &&
      this.position.y + this.velocity.y < CANVAS - this.height
    ) {
      this.position.y += this.velocity.y * this.speed;
    }
  }

  resize(scale) {
    this.position.x *= scale;
    this.position.y *= scale;
    this.width *= scale;
    this.height *= scale;
  }
}
