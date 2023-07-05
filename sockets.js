let readyPlayers = 0;

const listen = function (io) {
  const pongNameSpace = io.of('/pong');
  pongNameSpace.on('connection', (socket) => {
    // let room;
    console.log('connection already made', socket.id);

    socket.on('ready', () => {
      // room = `room${Math.floor(readyPlayers / 2)}`;
      // socket.join(room);

      console.log('a player is ready', socket.id);
      readyPlayers++;

      if (readyPlayers % 2 === 0) {
        //pongNameSpace.in(room).emit('startGame', socket.id);
        pongNameSpace.emit('startGame', socket.id);
      }
    });

    socket.on('paddleMove', (paddleData) => {
      // socket.to(room).emit('paddleMove', paddleData);
      socket.broadcast.emit('paddleMove', paddleData);
    });

    socket.on('ballMove', (ballData) => {
      // socket.to(room).emit('ballMove', ballData);
      socket.broadcast.emit('ballMove', ballData);
    });

    socket.on('disconnect', (reason) => {
      console.log(`player with ${socket.id} disconnected: ${reason}`);
      // socket.leave(room);
    });
  });
};

module.exports = {
  listen,
};
