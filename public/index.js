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
  balls.forEach(b => Ball.draw(b));
  cushions.forEach(c => drawCushion(c.vertices));
}


// ENGINE STUFF
const { Engine, Events, Render, Resolver, World, Body, Bodies, Mouse, MouseConstraint, Vector } = Matter;

const ENGINE_DELTA_TIME_MS = 1000 / 60;

const TABLE_LENGTH = 1000;
const TABLE_WIDTH = 500;

const CUSHION_WIDTH = 20;
const CUSHION_BOX_WIDTH = 50; // for correct chamfering
const CUSHION_BOUNDARY_OFFSET = (CUSHION_BOX_WIDTH / 2) - CUSHION_WIDTH;
const CUSHION_CORNER_RADIUS = 40;
const SIDE_CUSHION_LENGTH = TABLE_LENGTH * 0.45;
const TOP_CUSHION_LENGTH = TABLE_WIDTH * 0.88;

const FORCE_MULTIPLYER = 100;

Resolver._restingThresh = 0.01;

const hostGame = () => {
  let targetVector = null;

  const engine = Engine.create();
  window.engine = engine; // for debug
  engine.world.gravity = { x: 0, y: 0 };

  // mouse dragging stuff
  // const mouseConstraint = MouseConstraint.create(engine, { mouse: Mouse.create(document.body) });
  // World.add(engine.world, mouseConstraint);

  const cushionProperties = {
    isStatic: true,
    friction: 0.8,
    chamfer: { radius: [0, 0, CUSHION_CORNER_RADIUS, CUSHION_CORNER_RADIUS] },
  }

  const cushions = [
    // left side
    Bodies.rectangle(TABLE_LENGTH * 0.254, -CUSHION_BOUNDARY_OFFSET, SIDE_CUSHION_LENGTH, CUSHION_BOX_WIDTH, { ...cushionProperties }),
    Bodies.rectangle(TABLE_LENGTH * 0.746, -CUSHION_BOUNDARY_OFFSET, SIDE_CUSHION_LENGTH, CUSHION_BOX_WIDTH, { ...cushionProperties }),
    // right side
    Bodies.rectangle(TABLE_LENGTH * 0.254, TABLE_WIDTH + CUSHION_BOUNDARY_OFFSET, SIDE_CUSHION_LENGTH, CUSHION_BOX_WIDTH, { ...cushionProperties, angle: Math.PI }),
    Bodies.rectangle(TABLE_LENGTH * 0.746, TABLE_WIDTH + CUSHION_BOUNDARY_OFFSET, SIDE_CUSHION_LENGTH, CUSHION_BOX_WIDTH, { ...cushionProperties, angle: Math.PI }),
    // top + bottom
    Bodies.rectangle(TABLE_LENGTH + CUSHION_BOUNDARY_OFFSET, TABLE_WIDTH / 2, TOP_CUSHION_LENGTH, CUSHION_BOX_WIDTH, { ...cushionProperties, angle: 0.5 * Math.PI }),
    Bodies.rectangle(-CUSHION_BOUNDARY_OFFSET, TABLE_WIDTH / 2, TOP_CUSHION_LENGTH, CUSHION_BOX_WIDTH, { ...cushionProperties, angle: 1.5 * Math.PI }),
  ];
  cushions.forEach(b => b.restitution = 0.6);
  World.add(engine.world, [...cushions]);

  const balls = [
    new Ball(engine.world, engine, 0, { x: TABLE_LENGTH * 0.2, y: TABLE_WIDTH / 2 }),
    ...createRack({ x: TABLE_LENGTH * 0.7, y: TABLE_WIDTH / 2 }, engine.world, engine),
  ]

  socket.on('setTargetDirection', (targetPosition) => {
    targetVector = Vector.normalise(Vector.sub(targetPosition, balls[0].getState().position));
  });

  socket.on('fireCue', (desiredForce) => {
    if (!targetVector) return;
    const force = desiredForce * desiredForce * FORCE_MULTIPLYER;
    const forceVector = Vector.mult(targetVector, force);
    balls[0].applyForce(forceVector);
    World.remove(engine.world, targetVector);
    targetVector = null;
  });

  Events.on(engine, 'afterUpdate', () => {
    const gameState = {
      targetVector,
      balls: balls.map(b => b.getState()),
      cushions: cushions.map(c => ({
        vertices: c.vertices.map(({ x, y }) => ({ x, y })),
      })),
    };
    socket.emit('gameStateUpdated', gameState);
  });
  Engine.run(engine);
}

initialiseLobby(socket, hostGame);
registerInputListeners(socket);
