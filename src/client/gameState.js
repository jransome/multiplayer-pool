import socket from './socket';

const gameState = {
  balls: [],
  cushions: [],
  targetVector: null,
};

socket.on('gameStateUpdated', (newState) => {
  gameState.balls = newState.balls;
  gameState.cushions = newState.cushions; // TODO: update once at beginning
  gameState.targetVector = newState.targetVector;
});

export default gameState;
