const socket = io();
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

const drawCushion = (vertices) => {
  fill(180);
  stroke(180);
  strokeWeight(1);
  beginShape();
  vertices.forEach(v => vertex(v.x, v.y));
  endShape(CLOSE);
}

const drawTargetingLine = (cuePosition, directionVector) => {
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
}

function draw() {
  background(30, 50, 200);
  const { targetVector, balls, cushions } = gameState;
  if (targetVector) drawTargetingLine(balls[0].position, targetVector);
  Pocket.drawAll();
  cushions.forEach(c => drawCushion(c.vertices));
  balls.forEach(b => Ball.draw(b));
}

const hostGame = () => {
  const game = new Game(socket);
  game.start();
  window.game = game;
}

initialiseLobby(socket, hostGame);
registerInputListeners(socket);
