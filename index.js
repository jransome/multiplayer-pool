const { Engine, Events, Render, Resolver, World, Body, Bodies, Mouse, MouseConstraint } = Matter

const TABLE_LENGTH = 1000;
const TABLE_WIDTH = 500;
const CUSHION_WIDTH = 20;

const MAX_BALL_ANGULAR_VELOCITY = 0.3;

Resolver._restingThresh = 0.01;
const engine = Engine.create();
engine.world.gravity = { x: 0, y: 0 };

const render = Render.create({
  engine,
  element: document.body,
  options: {
    width: TABLE_LENGTH,
    height: TABLE_WIDTH,
    showAngleIndicator: true,
    // wireframes: false,
  }
});

// mouse stuff
const mouse = Mouse.create(document.body);
const mouseConstraint = MouseConstraint.create(engine, { mouse })
World.add(engine.world, mouseConstraint);
render.mouse = mouse; // keep the mouse in sync with rendering

const cushionProperties = {
  isStatic: true,
  friction: 0.8,
  chamfer: { radius: [0, 0, 30, 30] },
}
const CUSHION_BOX_WIDTH = 50; // for correct chamfering
const CUSHION_BOUNDARY_OFFSET = (CUSHION_BOX_WIDTH / 2) - CUSHION_WIDTH;
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
]
cushions.forEach(b => b.restitution = 0.4)

let FORCE_MULTIPLYER = 600

const ballProperties = {
  friction: 0.3,
  frictionStatic: 0.1,
  frictionAir: 0.01,
  restitution: 0.6,
  density: 200,
  render: {
    fillStyle: 'red', // set wireframes to false to make this work
  }
}

const balls = [
  Bodies.circle(200, 400, 15, ballProperties), // cue
  Bodies.circle(495, 305, 15, ballProperties),
  Bodies.circle(500, 310, 15, ballProperties),
  Bodies.circle(500, 300, 15, ballProperties),
]




Events.on(mouseConstraint, 'mousedown', function (event) {
  const mousePosition = event.mouse.position;
  console.log('mousedown at ' + mousePosition.x + ' ' + mousePosition.y);
  // Body.applyForce(balls[0], mousePosition, { x: 8 * FORCE_MULTIPLYER, y: -2 * FORCE_MULTIPLYER })
  // Body.setAngularVelocity(balls[0], -5)
});

Events.on(engine, 'beforeUpdate', () => {
  if (balls[0].angularSpeed >= MAX_BALL_ANGULAR_VELOCITY) {
    console.log(balls[0].angularVelocity)
    Body.setAngularVelocity(balls[0], MAX_BALL_ANGULAR_VELOCITY * Math.sign(balls[0].angularVelocity))
  }
})

World.add(engine.world, [...balls, ...cushions]);

Engine.run(engine);
Render.run(render);
