const BALL_PROPERTIES = {
  BODY: {
    friction: 0.3,
    frictionStatic: 0.1,
    frictionAir: 0,
    restitution: 0.6,
    density: 200,
  },
  COLOUR_MAP: {
    0: [220, 255, 255], // cue
    1: [255, 0, 0], // reds
    2: [255, 220, 0], // yellows
  },
  RADIUS: 15,
  MAX_ANGULAR_SPEED: 0.3,
};

const createBall = (world, type, position) => {
  const body = Bodies.circle(position.x, position.y, BALL_PROPERTIES.RADIUS, BALL_PROPERTIES.BODY);
  World.add(world, body);

  Events.on(engine, 'beforeUpdate', () => {
    if (body.speed < 6) {
      if (body.frictionAir === 0) Body.set(body, 'frictionAir', 0.01);
    } else {
      if (body.frictionAir > 0) Body.set(body, 'frictionAir', 0);
      Body.set(body, 'velocity', Vector.mult(body.velocity, 0.995));
    }

    if (body.angularSpeed >= BALL_PROPERTIES.MAX_ANGULAR_SPEED) {
      Body.setAngularVelocity(body, BALL_PROPERTIES.MAX_ANGULAR_SPEED * Math.sign(body.angularVelocity));
    }
  });

  const applyForce = (vector) => Body.applyForce(body, body.position, vector);

  const getGameState = () => ({
    colour: BALL_PROPERTIES.COLOUR_MAP[type],
    position: body.position,
  });

  return {
    applyForce,
    getGameState,
  }
}

const drawBall = ({ position, colour }) => {
  fill(...colour);
  stroke(...colour);
  strokeWeight(1);
  circle(position.x, position.y, BALL_PROPERTIES.RADIUS * 2);
}
