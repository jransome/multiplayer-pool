const { broadcastToRoom } = require('./server');
const Player = require('./player');

const SCOREBOARD_ROOM_ID = 'scoreboard'
let playerCollectionState = [];

Player.onCollectionUpdated((state) => {
  playerCollectionState = state.filter(playerDoc => playerDoc.leaderBoardVisible);
  if (playerCollectionState.length) broadcastToRoom(SCOREBOARD_ROOM_ID, 'scoreUpdate', playerCollectionState);
});

const register = (socket) => {
  socket.join(SCOREBOARD_ROOM_ID);
  if (playerCollectionState.length) socket.emit('scoreUpdate', playerCollectionState);
}

const deregister = (socket) => socket.leave(SCOREBOARD_ROOM_ID);

module.exports = {
  register,
  deregister,
}
