import Ball from './ Ball.js';
import Paddle from './Paddle.js';

const ball = new Ball(document.getElementById('ball'));
const playerPaddle = new Paddle(document.getElementById('player-paddle'));
const otherPlayerPaddle = new Paddle(
  document.getElementById('computer-paddle')
);
// const otherPlayerPaddle = document.getElementById('computer-paddle');
let player1Score = document.getElementById('player-score');
let player2Score = document.getElementById('computer-score');
const loadMessage = document.getElementById('load');

const socket = io('/pong');
let isReferee = false;
let prevTime;
let paddleIndex;
let paddle = [];

const update = function (time) {
  if (prevTime !== undefined) {
    const delta = time - prevTime;
    if (isReferee) {
      ball.updateBall(delta, [playerPaddle.rect(), otherPlayerPaddle.rect()]);
    }
    // computerPaddle.updatePaddle(delta, ball.y);
  }

  if (gameLost()) handleLostGame();
  prevTime = time;
  window.requestAnimationFrame(update);
};

const startGame = function () {
  paddleIndex = isReferee ? 0 : 1;
  //   console.log(paddleIndex);
  //   if (paddleIndex === 0) paddle = playerPaddle;
  //   if (paddleIndex === 1) paddle = otherPlayerPaddle;
  paddle[0] = playerPaddle;
  paddle[1] = otherPlayerPaddle;
  loadMessage.style.display = 'none';
  document.getElementById('ball').style.display = 'block';
  document.addEventListener('mousemove', (e) => {
    paddle[paddleIndex].position = (e.y / window.innerHeight) * 100;
  });
  socket.emit('paddleMove', {
    xPosition: paddle.position,
  });
};

const loadGame = function () {
  socket.emit('ready');
  loadMessage.style.display = 'block';
};
loadGame();

const gameLost = function () {
  const rect = ball.rect();
  return rect.right >= window.innerWidth || rect.left <= 0;
};

const handleLostGame = function () {
  const rect = ball.rect();

  if (rect.right >= window.innerWidth) {
    player1Score.textContent = parseInt(player1Score.textContent) + 1;
  } else {
    player2Score.textContent = parseInt(player2Score.textContent) + 1;
  }

  ball.reset();
  //   computerPaddle.reset();
  //   resetGame();
};

socket.on('connect', () => {
  console.log('connected as..', socket.id);
});

socket.on('startGame', (refereeId) => {
  console.log('ref', refereeId);
  isReferee = refereeId === socket.id;
  startGame();
});

socket.on('paddleMove', (paddleData) => {
  const opponentPaddlePosition = 1 - paddleIndex;
  paddle[opponentPaddlePosition].position = paddleData.xPosition;
});

socket.on('ballMove', (ballData) => {
  ball.x = ballData.ballX;
  ball.y = ballData.ballY;
  player1Score = ballData.player1Score;
  player2Score = ballData.player2Score;
});

window.requestAnimationFrame(update);
