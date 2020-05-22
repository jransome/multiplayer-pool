const { broadcastToRoom } = require('./server');
const Player = require('./player');

const SCOREBOARD_ROOM_ID = 'scoreboard'
let playerCollectionState = [];

const emitUpdate = (playerData) => broadcastToRoom(SCOREBOARD_ROOM_ID, 'scoreUpdate', playerData);

Player.onCollectionUpdated((state) => {
  playerCollectionState = state.filter(playerDoc => playerDoc.leaderBoardVisible);
  if (playerCollectionState.length) emitUpdate(playerCollectionState);
});

const register = (socket) => {
  socket.join(SCOREBOARD_ROOM_ID);
  if (playerCollectionState.length) socket.emit('scoreUpdate', JSON.stringify(playerCollectionState));
}

const deregister = (socket) => socket.leave(SCOREBOARD_ROOM_ID);

module.exports = {
  register,
  deregister,
}
