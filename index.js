const path = require('path');
const express = require('express');
const socket = require('socket.io');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(PORT, () => console.log('Server running'));

const socketServer = socket(server);

let idCounter = 0;

class Game {
  static idCounter = 0;

  constructor(hostSocket){
    this.id =`game-${++idCounter}`;
    this.startTime = Date.UTC();
  }

  join(socket) {
    socket.join(this.id);

    socket.on('gameStateUpdated', (data) => {
      socketServer.to(this.id).emit('gameStateUpdated', data);
    });
    socket.on('fireCue', (data) => {
      socketServer.to(this.id).emit('fireCue', data);
    });
    socket.on('setTargetDirection', (data) => {
      socketServer.to(this.id).emit('setTargetDirection', data);
    });
  }

  leave(socket){

  }
}

const joinGame = (socket, gameId) => {
  socket.join(gameId);

  socket.on('gameStateUpdated', (state) => {
    socketServer.to(gameId).emit('gameStateUpdated', state);
  });
  socket.on('fireCue', (state) => {
    socketServer.to(gameId).emit('fireCue', state);
  });
  socket.on('setTargetDirection', (state) => {
    socketServer.to(gameId).emit('setTargetDirection', state);
  });
}

socketServer.sockets.on('connect', (socket) => {
  console.log('new client connected, ID:', socket.id);

  socket.on('hosting', (ack) => {
    const gameId = ++idCounter;
    joinGame(socket, `game-${gameId}`);
    ack(gameId);
  });

  socket.on('joinAttempt', (gameId, ack) => {
    if (gameId > 0 && gameId <= idCounter) {
      joinGame(socket, `game-${gameId}`);
      ack(true);
    } else ack(false);
  });

  socket.on('disconnect', () => {
    console.log('client disconnected, ID:', socket.id);
  });
});
