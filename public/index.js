const socket = io();
const gameState = {
  balls: [], 
  cushions: [],
}

socket.on('gameStart', (data) => {
  gameState.cushions = data.cushions;
})

socket.on('gameStateUpdated', ({ balls }) => {
  gameState.balls = balls;
});

const BALL_TYPE_COLOUR_MAP = {
  0: [255, 255, 255], // cue
  1: [255, 0, 0], // reds
  2: [255, 255, 0], // yellows
}

const drawBall = (position, type) => {
  fill(...BALL_TYPE_COLOUR_MAP[type]);
  stroke(...BALL_TYPE_COLOUR_MAP[type]);
  circle(position.x, position.y, BALL_RADIUS * 2);
}

const drawCushion = (vertices) => {
  fill(180);
  stroke(180);
  beginShape();
  vertices.forEach(v => vertex(v.x, v.y));
  endShape(CLOSE);
}

function setup() {
  canvasElement = createCanvas(TABLE_LENGTH, TABLE_WIDTH).id('canvas').parent('game');
}

function draw() {
  background(30)
  gameState.balls.forEach(b => drawBall(b.position, b.type))
  gameState.cushions.forEach(c => drawCushion(c.vertices))
}

window.addEventListener('mousedown', ({ toElement, clientX, clientY }) => {
  if (toElement.id !== 'canvas') return;
  const canvasPosition = {
    x: clientX - toElement.offsetLeft,
    y: clientY - toElement.offsetTop,
  }
  console.log('mousedown at canvas space:', canvasPosition)
  socket.emit('positionTarget', canvasPosition);
});

window.addEventListener('keydown', (event) => {
  const desiredForce = +event.key;
  if (desiredForce < 0) return;
  socket.emit('fireCue', desiredForce);
});

// temp
window.addEventListener('keydown', (event) => {
  if (event.key === 'g') {
    console.log('hosting game...');
    hostGame();
  }
});
// temp

const { Engine, Events, Render, Resolver, World, Body, Bodies, Mouse, MouseConstraint, Vector } = Matter

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

const ballProperties = {
  friction: 0.3,
  frictionStatic: 0.1,
  frictionAir: 0.01,
  restitution: 0.6,
  density: 200,
}

const cushionProperties = {
  isStatic: true,
  friction: 0.8,
  chamfer: { radius: [0, 0, CUSHION_CORNER_RADIUS, CUSHION_CORNER_RADIUS] },
}

const hostGame = () => {
  let targetIndicator;

  const engine = Engine.create();
  window.engine = engine; // for debug
  engine.world.gravity = { x: 0, y: 0 };

  // mouse dragging stuff for host only
  const mouseConstraint = MouseConstraint.create(engine, { mouse: Mouse.create(document.body) });
  World.add(engine.world, mouseConstraint);

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
    }))
  })

  const balls = [
    Bodies.circle(200, 400, BALL_RADIUS, ballProperties), // cue
    Bodies.circle(495, 305, BALL_RADIUS, ballProperties),
    Bodies.circle(500, 310, BALL_RADIUS, ballProperties),
    Bodies.circle(500, 300, BALL_RADIUS, ballProperties),
  ];

  socket.on('positionTarget', (targetPosition) => {
    if (targetIndicator) World.remove(engine.world, targetIndicator);
    targetIndicator = Bodies.circle(targetPosition.x, targetPosition.y, 5, { isSensor: true });
    World.add(engine.world, targetIndicator);
  });

  socket.on('fireCue', (desiredForce) => {
    if (!targetIndicator) return;
    const force = desiredForce * desiredForce * FORCE_MULTIPLYER;
    const direction = Vector.normalise(Vector.sub(targetIndicator.position, balls[0].position));
    const forceVector = Vector.mult(direction, force);
    Body.applyForce(balls[0], balls[0].position, forceVector);
  });

  Events.on(engine, 'beforeUpdate', () => {
    if (balls[0].angularSpeed >= MAX_BALL_ANGULAR_VELOCITY) {
      console.log(balls[0].angularVelocity);
      Body.setAngularVelocity(balls[0], MAX_BALL_ANGULAR_VELOCITY * Math.sign(balls[0].angularVelocity));
    }
  });

  Events.on(engine, 'afterUpdate', () => {
    const gameState = {
      balls: balls.map(b => ({ position: b.position, type: 1 })),
      targetIndicator: { position: targetIndicator ? targetIndicator.position : null },
    }
    // console.log(gameState)
    socket.emit('gameStateUpdated', gameState);
  });

  World.add(engine.world, [...balls, ...cushions]);

  Engine.run(engine);
}
