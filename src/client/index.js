/* eslint-disable no-param-reassign */
const io = require('socket.io-client');
const P5 = require('p5');
const { TABLE_LENGTH, TABLE_WIDTH } = require('./constants');
const { initialiseLobby } = require('./lobby');
const { registerInputListeners } = require('./input');
const { initialiseScoreBoard } = require('./scoreboard');
const Ball = require('./Ball');
const Pocket = require('./Pocket');
const Game = require('./Game');

// TODO: RENAME FILE TO RENDER or something
const p5Instance = new P5((sketch) => {
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

  const renderCushion = (vertices) => {
    sketch.fill(0, 0, 60);
    sketch.stroke(0, 0, 60);
    sketch.strokeWeight(1);
    sketch.beginShape();
    vertices.forEach((v) => sketch.vertex(v.x, v.y));
    sketch.endShape(sketch.CLOSE);
  };

  const renderTargetingLine = (cuePosition, directionVector) => {
    sketch.stroke('white');
    sketch.strokeWeight(2);
    const endPoint = {
      x: cuePosition.x + directionVector.x * 1200,
      y: cuePosition.y + directionVector.y * 1200,
    };
    sketch.line(cuePosition.x, cuePosition.y, endPoint.x, endPoint.y);
  };

  sketch.setup = () => {
    console.log(TABLE_LENGTH, TABLE_WIDTH, 'AHHHHHHH')
    sketch.createCanvas(TABLE_LENGTH, TABLE_WIDTH).id('canvas').parent('game');
    sketch.colorMode(sketch.HSB);
  };

  sketch.draw = () => {
    sketch.background(233, 85, 78);
    const { targetVector, balls, cushions } = gameState;
    if (targetVector) renderTargetingLine(balls[0].position, targetVector);
    Pocket.renderAll(sketch);
    cushions.forEach((c) => renderCushion(c.vertices));
    balls.forEach((b) => Ball.render(sketch, b));
  };

  let hostedGame = null;

  const hostGame = () => {
    if (hostedGame) {
      hostedGame.reset();
      return;
    }
    hostedGame = new Game(socket);
    hostedGame.start();
    window.game = hostedGame; // for debug
  };

  registerInputListeners(socket, window);
  initialiseScoreBoard(socket, document);
  initialiseLobby(socket, document, hostGame);
});
