const socket = io();
const gameState = {
  balls: [],
  cushions: [],
  targetVector: null,
};

// temp way of forcing only one host
let isHost = null;
let stopGame = null;
window.addEventListener('keydown', (event) => {
  if ((isHost === null || isHost === true) && event.key === 'g') {
    console.log('hosting game...');
    hostGame();
    isHost = true;
  }
});
// temp

// RENDER STUFF
socket.on('gameStart', (data) => {
  if (isHost === null) isHost = false;
  gameState.cushions = data.cushions;
});

socket.on('gameStateUpdated', (newState) => {
  gameState.balls = newState.balls;
  gameState.targetVector = newState.targetVector;
});

const drawBall = (position, colour) => {
  fill(...colour);
  stroke(...colour);
  strokeWeight(1);
  circle(position.x, position.y, BALL_RADIUS * 2);
}

const drawCushion = (vertices) => {
  fill(180);
  stroke(180);
  strokeWeight(1);
  beginShape();
  vertices.forEach(v => vertex(v.x, v.y));
  endShape(CLOSE);
}

const drawTargetingLine = (cuePosition, directionVector) => {
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
  background(30);
  const { targetVector, balls, cushions } = gameState;
  if (targetVector) drawTargetingLine(balls[0].position, targetVector);
  balls.forEach(b => drawBall(b.position, b.colour));
  cushions.forEach(c => drawCushion(c.vertices));
}


// INPUT STUFF
let isMouseDown = false;
window.addEventListener('mousedown', ({ toElement }) => {
  console.log('mousedown in canvas space');
  if (toElement.id !== 'canvas') return;
  isMouseDown = true;
});

window.addEventListener('mouseup', () => {
  console.log('mouseup event');
  isMouseDown = false;
});

window.addEventListener('mousemove', ({ toElement, clientX, clientY }) => {
  if (!isMouseDown) return;
  if (toElement.id !== 'canvas') return;
  const canvasPosition = {
    x: clientX - toElement.offsetLeft,
    y: clientY - toElement.offsetTop,
  };
  socket.emit('setTargetDirection', canvasPosition);
});

window.addEventListener('keydown', (event) => {
  const desiredForce = +event.key;
  if (desiredForce < 0) return;
  socket.emit('fireCue', desiredForce);
});


// ENGINE STUFF
const { Engine, Events, Render, Resolver, World, Body, Bodies, Mouse, MouseConstraint, Vector } = Matter;

const ENGINE_DELTA_TIME_MS = 1000 / 60;

const TABLE_LENGTH = 1000;
const TABLE_WIDTH = 500;

const CUSHION_WIDTH = 20;
const CUSHION_BOX_WIDTH = 50; // for correct chamfering
const CUSHION_BOUNDARY_OFFSET = (CUSHION_BOX_WIDTH / 2) - CUSHION_WIDTH;
const CUSHION_CORNER_RADIUS = 30;

const BALL_RADIUS = 15;
const MAX_BALL_ANGULAR_VELOCITY = 0.3;
const FORCE_MULTIPLYER = 100;

Resolver._restingThresh = 0.01;

const cushionProperties = {
  isStatic: true,
  friction: 0.8,
  chamfer: { radius: [0, 0, CUSHION_CORNER_RADIUS, CUSHION_CORNER_RADIUS] },
}

const hostGame = () => {
  let targetVector = null;

  const engine = Engine.create();
  window.engine = engine; // for debug
  engine.world.gravity = { x: 0, y: 0 };

  // mouse dragging stuff for host only
  // const mouseConstraint = MouseConstraint.create(engine, { mouse: Mouse.create(document.body) });
  // World.add(engine.world, mouseConstraint);

  const cushions = [
    // left side
    Bodies.rectangle(TABLE_LENGTH * 0.255, -CUSHION_BOUNDARY_OFFSET, TABLE_LENGTH * 0.45, CUSHION_BOX_WIDTH, { ...cushionProperties }),
    Bodies.rectangle(TABLE_LENGTH * 0.745, -CUSHION_BOUNDARY_OFFSET, TABLE_LENGTH * 0.45, CUSHION_BOX_WIDTH, { ...cushionProperties }),
    // right side
    Bodies.rectangle(TABLE_LENGTH * 0.255, TABLE_WIDTH + CUSHION_BOUNDARY_OFFSET, TABLE_LENGTH * 0.45, CUSHION_BOX_WIDTH, { ...cushionProperties, angle: Math.PI }),
    Bodies.rectangle(TABLE_LENGTH * 0.745, TABLE_WIDTH + CUSHION_BOUNDARY_OFFSET, TABLE_LENGTH * 0.45, CUSHION_BOX_WIDTH, { ...cushionProperties, angle: Math.PI }),
    // top + bottom
    Bodies.rectangle(TABLE_LENGTH + CUSHION_BOUNDARY_OFFSET, TABLE_WIDTH / 2, TABLE_WIDTH * 0.87, CUSHION_BOX_WIDTH, { ...cushionProperties, angle: 0.5 * Math.PI }),
    Bodies.rectangle(-CUSHION_BOUNDARY_OFFSET, TABLE_WIDTH / 2, TABLE_WIDTH * 0.87, CUSHION_BOX_WIDTH, { ...cushionProperties, angle: 1.5 * Math.PI }),
  ];
  cushions.forEach(b => b.restitution = 0.6);
  socket.emit('gameStart', {
    cushions: cushions.map(c => ({
      vertices: c.vertices.map(({ x, y }) => ({ x, y })),
    })),
  });

  const balls = [
    createBall(engine.world, 0, { x: 200, y: 400 }),
    createBall(engine.world, 1, { x: 495, y: 305 }),
    createBall(engine.world, 1, { x: 500, y: 310 }),
    createBall(engine.world, 2, { x: 500, y: 300 }),
  ];

  socket.on('setTargetDirection', (targetPosition) => {
    targetVector = Vector.normalise(Vector.sub(targetPosition, balls[0].getGameState().position));
  });

  socket.on('fireCue', (desiredForce) => {
    if (!targetVector) return;
    const force = desiredForce * desiredForce * FORCE_MULTIPLYER;
    const forceVector = Vector.mult(targetVector, force);
    balls[0].applyForce(forceVector);
    World.remove(engine.world, targetVector);
    targetVector = null;
  });

  // Events.on(engine, 'beforeUpdate', () => {
  //   if (balls[0].angularSpeed >= MAX_BALL_ANGULAR_VELOCITY) {
  //     console.log(balls[0].angularVelocity);
  //     Body.setAngularVelocity(balls[0], MAX_BALL_ANGULAR_VELOCITY * Math.sign(balls[0].angularVelocity));
  //   }
  // });

  Events.on(engine, 'afterUpdate', () => {
    const gameState = {
      targetVector,
      balls: balls.map(b => b.getGameState()),
    };
    // console.log(gameState);
    socket.emit('gameStateUpdated', gameState);
  });

  World.add(engine.world, [...cushions]);
  // World.add(engine.world, [...balls.map(b => b.body), ...cushions]);

  Engine.run(engine);
}
