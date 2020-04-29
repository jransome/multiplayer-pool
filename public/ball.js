const BALL_PROPERTIES = {
  BODY: {
    friction: 0.3,
    frictionStatic: 0.1,
    frictionAir: 0,
    restitution: 0.65,
    density: 100,
  },
  COLOUR_MAP: {
    0: [250, 255, 225], // cue
    1: [10, 10, 10], // black
    2: [255, 0, 0], // reds
    3: [255, 220, 0], // yellows
  },
  RADIUS: 15,
  MAX_ANGULAR_SPEED: 0.3,
};

class Ball {
  constructor(world, engine, type, position) {
    this.type = type
    this.body = Bodies.circle(position.x, position.y, BALL_PROPERTIES.RADIUS, BALL_PROPERTIES.BODY);
    World.add(world, this.body);
    Events.on(engine, 'beforeUpdate', this._beforeUpdate.bind(this))
  }

  static draw(ballState) {
    const { position, colour } = ballState
    fill(...colour);
    stroke(...colour);
    strokeWeight(1);
    circle(position.x, position.y, BALL_PROPERTIES.RADIUS * 2);
  }

  applyForce(vector) {
    Body.applyForce(this.body, this.body.position, vector);
  }

  getState() {
    return {
      colour: BALL_PROPERTIES.COLOUR_MAP[this.type],
      position: this.body.position,
    }
  }

  _beforeUpdate() { // executes before engine tick
    // dampen speed
    if (this.body.speed < 6) {
      Body.set(this.body, 'velocity', Vector.mult(this.body.velocity, 0.985));
    } else {
      Body.set(this.body, 'velocity', Vector.mult(this.body.velocity, 0.997));
    }

    // dampen angular velocity
    if (this.body.angularSpeed > BALL_PROPERTIES.MAX_ANGULAR_SPEED) {
      Body.setAngularVelocity(this.body, BALL_PROPERTIES.MAX_ANGULAR_SPEED * Math.sign(this.body.angularVelocity));
    } else if (this.body.angularSpeed) {
      Body.setAngularVelocity(this.body, this.body.angularVelocity - (Math.sign(this.body.angularVelocity) * 0.001));
    }
  }
}

const createRack = (anchorPoint, world, engine) => {
  const { x, y } = anchorPoint;
  const rowDistance = BALL_PROPERTIES.RADIUS * 2 * 0.85;

  return [
    new Ball(world, engine, 3, anchorPoint),

    new Ball(world, engine, 2, { x: x + rowDistance, y: y - BALL_PROPERTIES.RADIUS }),
    new Ball(world, engine, 2, { x: x + rowDistance, y: y + BALL_PROPERTIES.RADIUS }),

    new Ball(world, engine, 3, { x: x + rowDistance * 2, y: y - BALL_PROPERTIES.RADIUS * 2 }),
    new Ball(world, engine, 1, { x: x + rowDistance * 2, y }),
    new Ball(world, engine, 3, { x: x + rowDistance * 2, y: y + BALL_PROPERTIES.RADIUS * 2 }),

    new Ball(world, engine, 2, { x: x + rowDistance * 3, y: y - BALL_PROPERTIES.RADIUS * 3 }),
    new Ball(world, engine, 3, { x: x + rowDistance * 3, y: y - BALL_PROPERTIES.RADIUS }),
    new Ball(world, engine, 2, { x: x + rowDistance * 3, y: y + BALL_PROPERTIES.RADIUS }),
    new Ball(world, engine, 2, { x: x + rowDistance * 3, y: y + BALL_PROPERTIES.RADIUS * 3 }),

    new Ball(world, engine, 3, { x: x + rowDistance * 4, y: y - BALL_PROPERTIES.RADIUS * 4 }),
    new Ball(world, engine, 3, { x: x + rowDistance * 4, y: y - BALL_PROPERTIES.RADIUS * 2 }),
    new Ball(world, engine, 2, { x: x + rowDistance * 4, y }),
    new Ball(world, engine, 3, { x: x + rowDistance * 4, y: y + BALL_PROPERTIES.RADIUS * 2 }),
    new Ball(world, engine, 2, { x: x + rowDistance * 4, y: y + BALL_PROPERTIES.RADIUS * 4 }),
  ]
}
