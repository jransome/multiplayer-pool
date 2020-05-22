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

    newSocket.on('hosting', (ack) => {
      session.hostGame(ack);
    });

    newSocket.on('joinAttempt', (gameId, ack) => {
      session.joinGame(gameId, ack);
    });
  });

  newSocket.on('disconnect', () => {
    scoreUpdater.deregister(newSocket);
    if (session) session.end();
    else console.debug('client disconnected, ID:', newSocket.id);
  });
  console.debug('new client connected, ID:', newSocket.id);
});
