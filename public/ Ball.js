const VELOCITY = 0.015;
const VELOCITY_INCREASE = 0.00001;
const socket = io('/pong');
let ballX;
let ballY;

export default class Ball {
  constructor(ballEl) {
    this.ballEl = ballEl;
    this.reset();
  }

  get x() {
    return parseFloat(getComputedStyle(this.ballEl).getPropertyValue('--x'));
  }

  set x(value) {
    this.ballEl.style.setProperty('--x', value);
  }

  get y() {
    return parseFloat(getComputedStyle(this.ballEl).getPropertyValue('--y'));
  }

  set y(value) {
    this.ballEl.style.setProperty('--y', value);
  }

  rect() {
    return this.ballEl.getBoundingClientRect();
  }

  reset(player1Score, player2Score) {
    this.x = 50;
    this.y = 50;
    this.direction = { x: 0, y: 0 };

    while (
      Math.abs(this.direction.x) <= 0.2 ||
      Math.abs(this.direction.x) >= 0.9
    ) {
      const heading = randomNumber(0, 2 * Math.PI);
      this.direction = { x: Math.cos(heading), y: Math.sin(heading) };
    }
    this.velocity = VELOCITY;

    ballX = this.x;
    ballY = this.y;
    socket.emit('ballMove', {
      ballX,
      ballY,
      player1Score,
      player2Score,
    });
  }

  updateBall(delta, paddleRect, player1Score, player2Score) {
    this.velocity += VELOCITY_INCREASE * delta;
    this.x += this.direction.x * this.velocity * delta;
    this.y += this.direction.y * this.velocity * delta;

    const rect = this.rect();
    if (rect.bottom >= window.innerHeight || rect.top <= 0) {
      this.direction.y *= -1;
    }

    if (paddleRect.some((r) => isCollision(r, rect))) {
      this.direction.x *= -1;
    }

    ballX = this.x;
    ballY = this.y;
    socket.emit('ballMove', {
      ballX,
      ballY,
      player1Score,
      player2Score,
    });
  }
}

const isCollision = function (rect1, rect2) {
  return (
    rect1.left <= rect2.right &&
    rect1.right >= rect2.left &&
    rect1.top <= rect2.bottom &&
    rect1.bottom >= rect2.top
  );
};

const randomNumber = function (min, max) {
  return Math.random() * (max - min) + min;
};
