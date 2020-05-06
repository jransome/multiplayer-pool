const path = require('path');
const express = require('express');
const socket = require('socket.io');
const Game = require('./src/game');
// const database = require('./database');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(PORT, () => console.log('Server running'));

const socketServer = socket(server);

const games = {};

socketServer.sockets.on('connect', (socket) => {
  let gameInstance = null;

  socket.on('hosting', (ack) => {
    const game = new Game(socket, socketServer);
    gameInstance = game;
    games[game.id] = game;
    ack(game.id);

    console.log(socket.id, 'hosted.', {
      ...gameInstance,
      socketServer: 'socketServer',
      hostPlayer: gameInstance.hostPlayer.id,
      guestPlayer: gameInstance.guestPlayer && gameInstance.guestPlayer.id
    });
  });

  socket.on('joinAttempt', (gameId, ack) => {
    const game = games[gameId];
    if (!game || game.ended) return ack(false);
    
    gameInstance = game;
    game.join(socket);
    ack(true);

    console.log(socket.id, 'joined.', {
      ...gameInstance,
      socketServer: 'socketServer',
      hostPlayer: gameInstance.hostPlayer.id,
      guestPlayer: gameInstance.guestPlayer && gameInstance.guestPlayer.id
    });
  });

  socket.on('disconnect', () => {
    if (!gameInstance) return;
    gameInstance.leave(socket);

    console.log(socket.id, 'disconnected.', {
      ...gameInstance,
      socketServer: 'socketServer',
      hostPlayer: gameInstance.hostPlayer.id,
      guestPlayer: gameInstance.guestPlayer && gameInstance.guestPlayer.id
    });
  });
  console.log('new client connected, ID:', socket.id);
});
