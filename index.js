const path = require('path');
const express = require('express');
const socket = require('socket.io');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(3000, () => console.log('Server running'));

const io = socket(server);

io.sockets.on('connection', (socket) => {
  console.log('new client connected, ID:', socket.id);
});
