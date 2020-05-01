class Ball {
  static BODY_IDS = { [CUE]: [], [BLACK]: [], [RED]: [], [YELLOW]: [] };

  constructor(engine, type, position) {
    this.type = type;
    this.startingPosition = position;
    this.body = Bodies.circle(position.x, position.y, BALL_PROPERTIES.RADIUS, BALL_PROPERTIES.PHYSICS);
    World.add(engine.world, this.body);
    Events.on(engine, 'beforeUpdate', this._beforeUpdate.bind(this));
    Ball.BODY_IDS[type].push(this.body.id);
  }

  static draw(ballState) {
    const { position, colour } = ballState;
    fill(colour);
    stroke(colour);
    strokeWeight(1);
    circle(position.x, position.y, BALL_PROPERTIES.RADIUS * 2);
  }

  resetPosition() {
    Body.setVelocity(this.body, { x: 0, y: 0 });
    Body.setPosition(this.body, this.startingPosition);
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

const createRack = (anchorPoint, engine) => {
  const { x, y } = anchorPoint;
  const rowDistance = BALL_PROPERTIES.RADIUS * 2 * 0.85;

  // TODO add tiny randomness to ball positions
  return [
    new Ball(engine, YELLOW, anchorPoint),

    new Ball(engine, RED, { x: x + rowDistance, y: y - BALL_PROPERTIES.RADIUS }),
    new Ball(engine, RED, { x: x + rowDistance, y: y + BALL_PROPERTIES.RADIUS }),

    new Ball(engine, YELLOW, { x: x + rowDistance * 2, y: y - BALL_PROPERTIES.RADIUS * 2 }),
    new Ball(engine, BLACK, { x: x + rowDistance * 2, y }),
    new Ball(engine, YELLOW, { x: x + rowDistance * 2, y: y + BALL_PROPERTIES.RADIUS * 2 }),

    new Ball(engine, RED, { x: x + rowDistance * 3, y: y - BALL_PROPERTIES.RADIUS * 3 }),
    new Ball(engine, YELLOW, { x: x + rowDistance * 3, y: y - BALL_PROPERTIES.RADIUS }),
    new Ball(engine, RED, { x: x + rowDistance * 3, y: y + BALL_PROPERTIES.RADIUS }),
    new Ball(engine, RED, { x: x + rowDistance * 3, y: y + BALL_PROPERTIES.RADIUS * 3 }),

    new Ball(engine, YELLOW, { x: x + rowDistance * 4, y: y - BALL_PROPERTIES.RADIUS * 4 }),
    new Ball(engine, YELLOW, { x: x + rowDistance * 4, y: y - BALL_PROPERTIES.RADIUS * 2 }),
    new Ball(engine, RED, { x: x + rowDistance * 4, y }),
    new Ball(engine, YELLOW, { x: x + rowDistance * 4, y: y + BALL_PROPERTIES.RADIUS * 2 }),
    new Ball(engine, RED, { x: x + rowDistance * 4, y: y + BALL_PROPERTIES.RADIUS * 4 }),
  ];
}
