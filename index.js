const path = require('path');
const express = require('express');
const socket = require('socket.io');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(PORT, () => console.log('Server running'));

const socketServer = socket(server);

class Game {
  static idCounter = 0;

  constructor(hostSocket) {
    this.id = ++Game.idCounter;
    this.startTime = null;
    this.duration = null;
    this.hostPlayer = hostSocket;
    this.guestPlayer = null;
    this.join(hostSocket);
    this.ended = false;
  }

  join(socket) {
    if (!this.guestPlayer) {
      this.guestPlayer = socket;
      this.startTime = new Date().toISOString()
    }
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

  leave(socket) {
    socket.leave(this.id);
    if (socket === this.hostPlayer || socket === this.guestPlayer) this.end();
  }

  end() {
    this.duration = Date.now() - new Date(this.startTime);
    this.ended = true;
    console.log(this.id, 'ended. Duration:', this.duration);
  }
}



const games = {};

socketServer.sockets.on('connect', (socket) => {
  console.log('new client connected, ID:', socket.id);
  let gameInstance;

  socket.on('hosting', (ack) => {
    const game = new Game(socket);
    games[game.id] = game;
    ack(game.id);

    gameInstance = game;
  });
  
  socket.on('joinAttempt', (gameId, ack) => {
    const game = games[gameId];
    if (!game || game.ended) return ack(false);
    
    game.join(socket);
    ack(true);
    
    gameInstance = game;
  });

  socket.on('disconnect', () => {
    if (!gameInstance) return;
    
    game.leave(socket);
    console.log('client disconnected, ID:', socket.id);
  });
});
