class Pocket {
  constructor(engine, position) {
    this.body = Bodies.circle(position.x, position.y, POCKET_PROPERTIES.COLLISION_RADIUS, POCKET_PROPERTIES.ENGINE);
    this.id = this.body.id;
    this.balls = [];
    World.add(engine.world, this.body);
    Events.on(engine, 'beforeUpdate', this._beforeUpdate.bind(this));

    Events.on(engine, 'collisionStart', ({ pairs }) => {
      this.balls = this.balls.concat(pairs.reduce((collisions, { bodyA, bodyB }) => {
        if (bodyA.id !== this.id && bodyB.id !== this.id) return collisions;
        const ball = Ball.instances[bodyA.id] || Ball.instances[bodyB.id];
        setTimeout(() => {
          if (this.balls.indexOf(ball) === -1) return;
          ball.sink()
        }, 100);
        return collisions.concat(ball);
      }, []));
    });

    Events.on(engine, 'collisionEnd', ({ pairs }) => {
      pairs.forEach(({ bodyA, bodyB }) => {
        if (bodyA.id !== this.id && bodyB.id !== this.id) return;
        const ball = Ball.instances[bodyA.id] || Ball.instances[bodyB.id];
        ball.cancelSink();
        this.balls.splice(this.balls.indexOf(ball, 1));
      });
    });
  }

  static renderAll() {
    POCKET_PROPERTIES.POSITIONS.forEach(pos => {
      fill(POCKET_PROPERTIES.COLOUR);
      stroke(POCKET_PROPERTIES.COLOUR);
      strokeWeight(2);
      circle(pos.x, pos.y, POCKET_PROPERTIES.VISIBLE_RADIUS * 2);

      // debug colliders
      // fill(0, 255, 0);
      // stroke(0, 255, 0);
      // strokeWeight(1);
      // circle(pos.x, pos.y, POCKET_PROPERTIES.COLLISION_RADIUS * 2);
    });
  }

  _beforeUpdate() {
    if (!this.balls.length) return;
    this.balls.forEach((b) => {
      const attractionVector = Vector.normalise(Vector.sub(this.body.position, b.position));
      b.applyForce(Vector.mult(attractionVector, 50));
    });
  }
}
