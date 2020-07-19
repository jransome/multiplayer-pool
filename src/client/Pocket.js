const { Events, World, Bodies, Vector } = require('matter-js');
const { POCKET_PROPERTIES } = require('./constants');
const Ball = require('./Ball');

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

  get position() {
    return this.body.position;
  }

  onCollisionStart(otherBody) {
    const ball = Ball.instances[otherBody.id];
    if (!ball) return;

    this.balls.add(ball);
    ball.capture(this);
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

module.exports = Pocket;
