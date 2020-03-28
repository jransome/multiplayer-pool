const { Engine, Events, Render, World, Body, Bodies, Mouse, MouseConstraint } = Matter

const engine = Engine.create();
const render = Render.create({
  engine,
  element: document.body,
});

// mouse stuff
const mouse = Mouse.create(document.body);
const mouseConstraint = MouseConstraint.create(engine, { mouse })
World.add(engine.world, mouseConstraint);
render.mouse = mouse; // keep the mouse in sync with rendering


const bounds = [
  Bodies.rectangle(400, 610, 810, 60, { isStatic: true }),
  Bodies.rectangle(400, -10, 810, 60, { isStatic: true }),
  Bodies.rectangle(-10, 400, 810, 60, { isStatic: true, angle: 0.5 * Math.PI }),
  Bodies.rectangle(810, 400, 810, 60, { isStatic: true, angle: 0.5 * Math.PI }),
]

const boxA = Bodies.rectangle(300, 150, 80, 100);
const boxB = Bodies.rectangle(350, 190, 80, 80);
World.add(engine.world, [boxA, boxB, ...bounds]);

engine.world.gravity = { x: 0, y: 0 }



Events.on(mouseConstraint, 'mousedown', function (event) {
  const mousePosition = event.mouse.position;
  console.log('mousedown at ' + mousePosition.x + ' ' + mousePosition.y);
  Body.applyForce(boxA, mousePosition, { x: 0.05, y: 0 })
});

Engine.run(engine);
Render.run(render);
