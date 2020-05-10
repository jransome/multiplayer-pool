const path = require('path');
const express = require('express');
const socket = require('socket.io');
const Game = require('./src/game');
const Player = require('./src/player');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(PORT, () => console.log('Server running'));

const socketServer = socket(server);

const games = {};

socketServer.sockets.on('connect', (socket) => {
  const session = {
    gameInstance: null,
    playerInstance: null,
  };

  socket.on('hosting', (playerName, ack) => {
    session.playerInstance = Player.createIfNotExists(playerName);
    const game = new Game(session.playerInstance, socket, socketServer);
    session.gameInstance = game;
    games[game.id] = game;
    ack(game.id);

    console.log(socket.id, 'hosted.', {
      ...session.gameInstance,
      socketServer: 'socketServer',
      hostPlayer: session.gameInstance.hostPlayer.id,
      guestPlayer: session.gameInstance.guestPlayer && session.gameInstance.guestPlayer.id
    });
  });

  socket.on('joinAttempt', ({ gameId, playerName }, ack) => {
    const game = games[gameId];
    if (!game || game.ended) return ack(false);

    session.playerInstance = Player.createIfNotExists(playerName);
    session.gameInstance = game;
    game.join(socket);
    ack(true);

    console.log(socket.id, 'joined.', {
      ...session.gameInstance,
      socketServer: 'socketServer',
      hostPlayer: session.gameInstance.hostPlayer.id,
      guestPlayer: session.gameInstance.guestPlayer && session.gameInstance.guestPlayer.id
    });
  });

  socket.on('disconnect', () => {
    if (!session.gameInstance) return;

    session.gameInstance.leave(socket);
    session.playerInstance.logout();

    console.log(socket.id, 'disconnected.', {
      ...session.gameInstance,
      socketServer: 'socketServer',
      hostPlayer: session.gameInstance.hostPlayer.id,
      guestPlayer: session.gameInstance.guestPlayer && session.gameInstance.guestPlayer.id
    });
  });
  console.log('new client connected, ID:', socket.id);
});
