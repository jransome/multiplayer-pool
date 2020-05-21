class Ball {
  static instances = {};

  constructor(engine, type, position) {
    this.type = type;
    this.startingPosition = position;
    this.body = Bodies.circle(position.x, position.y, BALL_PROPERTIES.RADIUS, BALL_PROPERTIES.ENGINE);
    this.id = this.body.id;
    this.isSinking = false;
    this.sinkProgress = 0;
    this.pocket = null;
    this.colour = [...BALL_PROPERTIES.COLOUR_MAP[type]];
    World.add(engine.world, this.body);
    Events.on(engine, 'beforeUpdate', this._beforeUpdate.bind(this));
    Ball.instances[this.id] = this;
  }

  static render(ballState) {
    const { position, colour } = ballState;
    fill(colour);
    stroke(colour);
    strokeWeight(1);
    circle(position.x, position.y, BALL_PROPERTIES.RADIUS * 2);
  }

  get position() {
    return this.body.position;
  }

  get isStatic() {
    return this.body.isStatic;
  }

  onCollisionStart(otherBody) {
    // implement some rule logic
  }

  onCollisionEnd(otherBody) {
    // implement some rule logic
  }

  capture(pocket) {
    this.pocket = pocket;
  }

  sink() {
    if (!this.isSinking) return;
    if (this.type === CUE) {
      this.reset();
      return;
    }
    Body.set(this.body, 'isSensor', true);
    Body.set(this.body, 'isStatic', true);
  }
  
  cancelSink() {
    this.pocket = null;
    this.isSinking = false;
    this.sinkProgress = 0;
    this.colour = [...BALL_PROPERTIES.COLOUR_MAP[this.type]];
    Body.set(this.body, 'isStatic', false);
    Body.set(this.body, 'isSensor', false);
  }

  reset() {
    Body.setVelocity(this.body, { x: 0, y: 0 });
    Body.setPosition(this.body, this.startingPosition);
    this.cancelSink();
  }

  applyForce(vector) {
    Body.applyForce(this.body, this.body.position, vector);
  }

  getState() {
    return {
      colour: this.colour,
      position: this.body.position,
    }
  }

  _beforeUpdate() { // executes before engine tick
    if (this.pocket && this.sinkProgress < BALL_PROPERTIES.SINK_DURATION_FRAMES) {
      const distance = Vector.magnitude(Vector.sub(this.position, this.pocket.position));
      this.isSinking = distance < BALL_PROPERTIES.RADIUS;
      if (this.isSinking) {
        this.colour[2] -= 5;
        this.sinkProgress += 1;
        if (this.sinkProgress >= BALL_PROPERTIES.SINK_DURATION_FRAMES) this.sink();
      }
      return;
    }

    // dampen velocity
    const { CONSTANT_FRICTION_MULTIPLYER, DYNAMIC_FRICTION_MULTIPLYER, MAX_ANGULAR_SPEED } = BALL_PROPERTIES;
    const normalisedInverse = Vector.mult(Vector.normalise(this.body.velocity), -1);
    const friction = Vector.add(
      Vector.mult(normalisedInverse, CONSTANT_FRICTION_MULTIPLYER), // constant friction
      Vector.mult(normalisedInverse, this.body.speed * DYNAMIC_FRICTION_MULTIPLYER), // dynamic friction
    );
    this.applyForce(friction);

    // dampen angular velocity
    if (this.body.angularSpeed > MAX_ANGULAR_SPEED) {
      Body.setAngularVelocity(this.body, MAX_ANGULAR_SPEED * Math.sign(this.body.angularVelocity));
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
