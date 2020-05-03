const { Engine, Events, Render, Resolver, World, Body, Bodies, Mouse, MouseConstraint, Vector } = Matter;
Resolver._restingThresh = 0.01; // Reduce velocity threshold required for engine to calculate ball bounces


// TODO: extract to another file
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
// TODO: extract to another file


class Game {
  constructor(socket) {
    this.socket = socket;
    this.targetVector = null;
    this.engine = Engine.create({ constraintIterations: 4, velocityIterations: 8, positionIterations: 12 }); // increase simulation quality
    this.engine.world.gravity = { x: 0, y: 0 };
    this.pockets = POCKET_PROPERTIES.POSITIONS.map(pos => new Pocket(this.engine, pos));
    this.balls = [
      new Ball(this.engine, CUE, { x: TABLE_LENGTH * 0.2, y: TABLE_WIDTH / 2 }),
      ...createRack({ x: TABLE_LENGTH * 0.7, y: TABLE_WIDTH / 2 }, this.engine),
    ];
    World.add(this.engine.world, cushions);
    Events.on(this.engine, 'afterUpdate', this._broadcastGameState.bind(this));
    socket.on('fireCue', this._fireCueBall.bind(this));
    socket.on('setTargetDirection', this._setTargetDirection.bind(this));
  }

  start() {
    Engine.run(this.engine);
  }

  reset() {
    this.balls.forEach(b => b.resetPosition());
  }

  _setTargetDirection(targetPosition) {
    this.targetVector = Vector.normalise(Vector.sub(targetPosition, this.balls[0].getState().position));
  }

  _fireCueBall(desiredForce) {
    if (!this.targetVector) return;
    const force = desiredForce * desiredForce * FORCE_MULTIPLYER;
    const forceVector = Vector.mult(this.targetVector, force);
    this.balls[0].applyForce(forceVector);
    World.remove(this.engine.world, this.targetVector);
    this.targetVector = null;
  }

  _broadcastGameState() {
    const gameState = {
      targetVector: this.targetVector,
      balls: this.balls.map(b => b.getState()),
      cushions: cushions.map(c => ({ // TODO do once on handshake
        vertices: c.vertices.map(({ x, y }) => ({ x, y })),
      })),
    };
    this.socket.emit('gameStateUpdated', gameState);
  }
}
