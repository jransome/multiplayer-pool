const Game = require('./game');

class Session {
  constructor(playerInstance, socket) {
    this.socket = socket;
    this.playerInstance = playerInstance;
    this.gameInstance = null;
  }

  hostGame(ack) {
    this.gameInstance = new Game(this.playerInstance);
    ack(this.gameInstance.socketRoomId);

    console.log(`${this.playerInstance.name} (${this.socket.id}) hosted game #${this.gameInstance.socketRoomId}`);
  }

  joinGame(gameId, ack) {
    const game = Game.instances[gameId];
    if (!game || !game.inProgress) return ack(false);

    this.gameInstance = game;
    game.join(this.playerInstance);
    ack(true);

    console.log(`${this.playerInstance.name} (${this.socket.id}) joined game #${game.socketRoomId} (${game.hostPlayer.name}'s game)`);
  }

  end() {
    if (this.gameInstance) this.gameInstance.leave(this.playerInstance);
    this.playerInstance.logout();

    console.log(
      `${this.playerInstance.name} (${this.socket.id}) logged out`,
      this.gameInstance ? `after playing game #${this.gameInstance.socketRoomId} (${this.gameInstance.hostPlayer.name}'s game)` : 'without playing a game',
    );
  }
}

module.exports = Session;
