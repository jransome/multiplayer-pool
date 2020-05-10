const path = require('path');
const express = require('express');
const socket = require('socket.io');
const Session = require('./src/session');
const Player = require('./src/player');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(PORT, () => console.log('Server running'));

const socketServer = socket(server);

socketServer.sockets.on('connect', (socket) => {
  let session = null;

  socket.on('login', async (playerName) => {
    console.log(`${playerName} (${socket.id}) logged in!`);
    const player = await Player.createIfNotExists(playerName, socket);
    session = new Session(player, socket, socketServer);

    socket.on('hosting', (ack) => {
      session.hostGame(ack);
    });

    socket.on('joinAttempt', (gameId, ack) => {
      session.joinGame(gameId, ack);
    });
  });

  socket.on('disconnect', () => {
    if (session) session.end();
    else console.debug('client disconnected, ID:', socket.id);
  });
  console.debug('new client connected, ID:', socket.id);
});
