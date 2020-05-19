function initCollisionManager(engine) {
  Events.on(engine, 'collisionStart', ({ pairs }) => {
    pairs.forEach(({ bodyA, bodyB }) => {
      const gameObject1 = Ball.instances[bodyA.id] || Pocket.instances[bodyA.id];
      const gameObject2 = Ball.instances[bodyB.id] || Pocket.instances[bodyB.id];
      if (!gameObject1 || !gameObject2) return;
      
      gameObject1.onCollisionStart(gameObject2.body);
      gameObject2.onCollisionStart(gameObject1.body);
    });
  });
  
  Events.on(engine, 'collisionEnd', ({ pairs }) => {
    pairs.forEach(({ bodyA, bodyB }) => {
      const gameObject1 = Ball.instances[bodyA.id] || Pocket.instances[bodyA.id];
      const gameObject2 = Ball.instances[bodyB.id] || Pocket.instances[bodyB.id];
      if (!gameObject1 || !gameObject2) return;

      gameObject1.onCollisionEnd(gameObject2.body);
      gameObject2.onCollisionEnd(gameObject1.body);
    });
  });
}
