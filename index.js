const path = require('path');
const express = require('express');
const socket = require('socket.io');
const game = require('./lib/game');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(3000, () => console.log('Server running'));

const socketServer = socket(server);

socketServer.sockets.on('connection', (socket) => {
  console.log('new client connected, ID:', socket.id);
});


game.gameEvents.on('gameStateUpdated', (newState) => {
  socketServer.emit('gameStateUpdated', newState);
});

setTimeout(game.start, 5000);
// game.start();

