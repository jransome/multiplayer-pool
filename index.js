const { server } = require('./src/server');
const scoreUpdater = require('./src/scores');
const Session = require('./src/session');
const Player = require('./src/player');

server.sockets.on('connect', (newSocket) => {
  scoreUpdater.register(newSocket);
  let session = null;

  newSocket.on('login', async (playerName, allowLogin) => {
    if (Player.isAlreadyLoggedIn(playerName)) {
      console.log(`${playerName} (${newSocket.id}) attempted to login but was already logged in`);
      allowLogin(false);
      return;
    }

    allowLogin(true);
    console.log(`${playerName} (${newSocket.id}) logged in!`);
    const player = await Player.createIfNotExists(playerName, newSocket);
    session = new Session(player, newSocket);
  });

  newSocket.on('disconnect', () => {
    scoreUpdater.deregister(newSocket);
    if (session) session.end();
    console.log('client disconnected, ID:', newSocket.id);
    console.log(`${Player.instances.size} player(s) still logged in${Player.instances.size ?': ' + [...Player.instances].map(p => p.name).join(', ') : ''}`);
  });
  console.log('new client connected, ID:', newSocket.id);
});
