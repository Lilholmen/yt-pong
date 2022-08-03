const CANVAS = document.querySelector('canvas')
const context = CANVAS.getContext('2d')

CANVAS.width = 700
CANVAS.height = 360

const score = {
    playerLeft: 0,
    playerRight: 0,
}

class Paddle {
    constructor({position}) {
        this.position = position
        this.velocity = {
            x: 0,
            y: 0,
        }
        this.width = 10
        this.height = 100

        this.speed = 3
    }

    draw() {
        context.fillStyle = 'white'
        context.fillRect(this.position.x, this.position.y, this.width, this.height)
    }

    update() {
        this.draw()

        if (this.position.y + this.velocity.y > 0 && this.position.y + this.velocity.y < CANVAS.height - this.height) {
            this.position.y += this.velocity.y * this.speed
        }
    }
}

class Ball {
    constructor({position}) {
        this.position = position
        this.direction = {
            x: Math.random() > 0.5 ? 1 : -1,
            y: Math.random() > 0.5 ? 1 : -1,
        }
        this.velocity = {
            x: this.direction.x,
            y: this.direction.y,
        }
        this.width = 10
        this.height = 10
    }

    draw() {
        context.fillStyle = 'white'
        context.fillRect(this.position.x, this.position.y, this.width, this.height)
    }

    update() {
        this.draw()
        
        if (this.position.y + this.velocity.y <= 0 || this.position.y + this.velocity.y >= CANVAS.height - this.height) {
            this.velocity.y *= -1
        }

        if (this.position.x + this.velocity.x <= 0 || this.position.x + this.velocity.x >= CANVAS.width - this.width) {
            if (this.velocity.x < 0) {
                score.playerRight++
            } else 
                score.playerLeft++
            console.log(score)

            this.velocity.x *= -1
        }

        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

const paddleLeft = new Paddle({position: {
    x: 10,
    y: 100,
}})

const paddleRight = new Paddle({position: {
    x: CANVAS.width - 10 * 2,
    y: 100,
}})

const ball = new Ball({position: {
    x: CANVAS.width / 2,
    y: CANVAS.height / 2,
}})
 

function aniamte() {
    requestAnimationFrame(aniamte)

    context.fillStyle = 'black'
    context.fillRect(0,0, CANVAS.width, CANVAS.height)
    paddleLeft.update()
    paddleRight.update()
    ball.update()
}

aniamte()

addEventListener('keydown', (event) => {
    switch(event.key) {
        case 'ArrowUp':
            paddleLeft.velocity.y = -1
        break;
        case 'ArrowDown':
            paddleLeft.velocity.y = 1
        break;
        case 'w':
            paddleRight.velocity.y = -1
        break;
        case 's':
            paddleRight.velocity.y = 1
        break;

    }
})

addEventListener('keyup', (event) => {
    switch(event.key) {
        case 'ArrowUp':
        case 'ArrowDown':
            paddleLeft.velocity.y = 0
        break;
        case 'w':
        case 's':
            paddleRight.velocity.y = 0
        break;

    }
})