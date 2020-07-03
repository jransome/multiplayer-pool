const path = require('path');
const express = require('express');
const socket = require('socket.io');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.static(path.join(__dirname, '../dist')));

const expressServer = app.listen(PORT, () => console.log('Server running'));
const socketServer = socket(expressServer);

module.exports = {
  server: socketServer,
  broadcastToRoom: (room, eventName, data) => socketServer.to(room).emit(eventName, data),
};
