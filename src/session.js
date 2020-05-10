const Game = require('./game');

class Session {
  static activeInstances = [];

  constructor(playerInstance, socket) {
    this.socket = socket;
    this.playerInstance = playerInstance;
    this.gameInstance = null;
    Session.activeInstances.push(this);
  }

  hostGame(ack) {
    this.gameInstance = new Game(this.playerInstance);
    ack(this.gameInstance.socketRoomId);

    console.log(`${this.playerInstance.name} (${this.socket.id}) hosted game #${this.gameInstance.socketRoomId}`);
  }

  joinGame(gameId, ack) {
    const game = Game.instances[gameId];
    if (!game || game.ended) {
      console.log(this.playerInstance.name, 'attempted to join game #', gameId, 'but failed:', { exists: !!game, ended: game && game.ended });
      return ack(false);
    }

    this.gameInstance = game;
    game.join(this.playerInstance);
    ack(true);

    console.log(`${this.playerInstance.name} (${this.socket.id}) joined game #${game.socketRoomId} (${game.hostPlayer.name}'s game)`);
  }

  end() {
    if (this.gameInstance) this.gameInstance.leave(this.playerInstance);
    this.playerInstance.logout();
    Session.activeInstances.splice(Session.activeInstances.indexOf(this), 1);

    console.log(
      `${this.playerInstance.name} (${this.socket.id}) logged out`,
      this.gameInstance ? `after playing game #${this.gameInstance.socketRoomId} (${this.gameInstance.hostPlayer.name}'s game)` : 'without playing a game',
    );
    console.log(`Players still logged in: ${Session.activeInstances.map(s => s.playerInstance.name).join(', ')} (${Session.activeInstances.length})`);
  }
}

module.exports = Session;
