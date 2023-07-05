import Ball from './ Ball.js';
import Paddle from './Paddle.js';

const ball = new Ball(document.getElementById('ball'));
// const score = document.getElementById('score');
const player1Paddle = new Paddle(document.getElementById('player-paddle'));
const player2Paddle = new Paddle(document.getElementById('computer-paddle'));
let player1Score = document.getElementById('player-score').textContent;
let player2Score = document.getElementById('computer-score').textContent;
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
      ball.updateBall(
        delta,
        [player1Paddle.rect(), player2Paddle.rect()],
        player1Score,
        player2Score
      );
    }
    // computerPaddle.updatePaddle(delta, ball.y);
  }
  prevTime = time;

  //paddlemove
  paddleMove();

  //lost game
  if (gameLost()) handleLostGame();
  window.requestAnimationFrame(update);
};

paddle[0] = player1Paddle;
paddle[1] = player2Paddle;

const startGame = function () {
  loadMessage.style.display = 'none';
  document.getElementById('ball').style.display = 'block';
  document.getElementById('player-score').style.display = 'flex';
  document.getElementById('computer-score').style.display = 'flex';

  document.addEventListener('mousemove', (e) => {
    paddle[paddleIndex].position = (e.y / window.innerHeight) * 100;
  });
};

const paddleMove = function () {
  paddleIndex = isReferee ? 0 : 1;
  socket.emit('paddleMove', {
    xPosition: paddle[paddleIndex].position,
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
    player1Score = parseInt(player1Score) + 1;
  } else {
    player2Score = parseInt(player2Score) + 1;
  }
  ball.reset(player1Score, player2Score);
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
  document.getElementById('player-score').textContent = ballData.player1Score;
  document.getElementById('computer-score').textContent = ballData.player2Score;
});

window.requestAnimationFrame(update);
