class Pocket {
  constructor(engine, position) {
    this.body = Bodies.circle(position.x, position.y, POCKET_PROPERTIES.COLLISION_RADIUS, POCKET_PROPERTIES.PHYSICS);
    World.add(engine.world, this.body);
    Events.on(engine, 'collisionStart', this._onCollision.bind(this));
  }

  static drawAll() {
    POCKET_PROPERTIES.POSITIONS.forEach(pos => {
      fill(POCKET_PROPERTIES.COLOUR);
      stroke(POCKET_PROPERTIES.COLOUR);
      strokeWeight(2);
      circle(pos.x, pos.y, POCKET_PROPERTIES.VISIBLE_RADIUS * 2);

      // debug colliders
      fill(255,255,0);
      stroke(255,255,0);
      strokeWeight(1);
      circle(pos.x, pos.y, POCKET_PROPERTIES.COLLISION_RADIUS * 2);
    });
  }

  _onCollision({ pairs: [{ bodyA, bodyB }] }) {
    if (bodyA.id !== this.body.id && bodyB.id !== this.body.id) return;
    console.log('hit by ball!', bodyA, bodyB);
  }
}
