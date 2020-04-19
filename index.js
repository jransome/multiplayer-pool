const path = require('path');
const express = require('express');
const socket = require('socket.io');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(3001, () => console.log('Server running'));

const socketServer = socket(server);

const players = [];


socketServer.sockets.on('connect', (socket) => {
  console.log('new client connected, ID:', socket.id);
  players.push(socket.id);
  socket.join('game1');

  socket.on('gameStart', (state) => {
    socketServer.to('game1').emit('gameStart', state)
  })
  socket.on('gameStateUpdated', (state) => {
    socketServer.to('game1').emit('gameStateUpdated', state)
  })
  socket.on('fireCue', (state) => {
    socketServer.to('game1').emit('fireCue', state)
  })
  socket.on('setTargetDirection', (state) => {
    socketServer.to('game1').emit('setTargetDirection', state)
  })

  socket.on('disconnect', () => {
    console.log('client disconnected, ID:', socket.id);
  });
});
