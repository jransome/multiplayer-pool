class Pocket {
  static instances = {};

  constructor(engine, position) {
    this.body = Bodies.circle(position.x, position.y, POCKET_PROPERTIES.COLLISION_RADIUS, POCKET_PROPERTIES.ENGINE);
    this.id = this.body.id;
    this.balls = new Set();
    Pocket.instances[this.id] = this;
    World.add(engine.world, this.body);
    Events.on(engine, 'beforeUpdate', this._beforeUpdate.bind(this));
  }

  static renderAll() {
    POCKET_PROPERTIES.POSITIONS.forEach(pos => {
      fill(POCKET_PROPERTIES.COLOUR);
      stroke(POCKET_PROPERTIES.COLOUR);
      strokeWeight(2);
      circle(pos.x, pos.y, POCKET_PROPERTIES.VISIBLE_RADIUS * 2);

      // debug colliders
      // fill(30, 100, 100);
      // stroke(30, 100, 100);
      // strokeWeight(1);
      // circle(pos.x, pos.y, POCKET_PROPERTIES.COLLISION_RADIUS * 2);
    });
  }

  onCollisionStart(otherBody) {
    const ball = Ball.instances[otherBody.id];
    if (!ball) return;

    this.balls.add(ball);
    setTimeout(() => {
      if (this.balls.has(ball)) ball.sink();
    }, 200);
  }

  onCollisionEnd(otherBody) {
    const ball = Ball.instances[otherBody.id];
    if (!ball) return;
  
    if (ball.isStatic) return; // already sunk
    ball.cancelSink();
    this.balls.delete(ball);
  }

  _beforeUpdate() {
    if (!this.balls.size) return;
    this.balls.forEach((b) => {
      const attractionVector = Vector.normalise(Vector.sub(this.body.position, b.position));
      b.applyForce(Vector.mult(attractionVector, 50));
    });
  }
}
