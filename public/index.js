const socket = io();


socket.on('scoreUpdate', (playerData) => {
  console.log('scoreUPdate', playerData)
});

const gameState = {
  balls: [],
  cushions: [],
  targetVector: null,
};

// RENDER STUFF
socket.on('gameStateUpdated', (newState) => {
  gameState.balls = newState.balls;
  gameState.cushions = newState.cushions;
  gameState.targetVector = newState.targetVector;
});

const renderCushion = (vertices) => {
  fill(0, 0, 60);
  stroke(0, 0, 60);
  strokeWeight(1);
  beginShape();
  vertices.forEach(v => vertex(v.x, v.y));
  endShape(CLOSE);
}

const renderTargetingLine = (cuePosition, directionVector) => {
  stroke('white');
  strokeWeight(2);
  const endPoint = {
    x: cuePosition.x + directionVector.x * 1200,
    y: cuePosition.y + directionVector.y * 1200,
  };
  line(cuePosition.x, cuePosition.y, endPoint.x, endPoint.y);
}

function setup() {
  canvasElement = createCanvas(TABLE_LENGTH, TABLE_WIDTH).id('canvas').parent('game');
  colorMode(HSB);
}

function draw() {
  background(233, 85, 78);
  const { targetVector, balls, cushions } = gameState;
  if (targetVector) renderTargetingLine(balls[0].position, targetVector);
  Pocket.renderAll();
  cushions.forEach(c => renderCushion(c.vertices));
  balls.forEach(b => Ball.render(b));
}

let hostedGame = null;

const hostGame = () => {
  if (hostedGame) {
    hostedGame.reset();
    return
  }
  hostedGame = new Game(socket);
  hostedGame.start();
  window.game = hostedGame; // for debug
}

registerInputListeners(socket);
const lobby = initialiseLobby(socket, hostGame);
