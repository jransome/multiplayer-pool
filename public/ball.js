const BALL_PROPERTIES = {
  ENGINE: {
    friction: 0.3,
    frictionStatic: 0.1,
    frictionAir: 0.01,
    restitution: 0.6,
    density: 200,
  },
  COLOUR_MAP: {
    0: [220, 255, 255], // cue
    1: [255, 0, 0], // reds
    2: [255, 220, 0], // yellows
  },
  RADIUS: 15,
};

const createBall = (world, type, position) => {
  const body = Bodies.circle(position.x, position.y, BALL_PROPERTIES.RADIUS, BALL_PROPERTIES.ENGINE);
  World.add(world, body);

  return {
    type,
    applyForce: (vector) => Body.applyForce(body, body.position, vector),
    getGameState: () => ({
      colour: BALL_PROPERTIES.COLOUR_MAP[type],
      position: body.position,
    }),
  }
}
