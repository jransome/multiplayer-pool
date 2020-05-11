const { GameCollection } = require('./database');
const { broadcastToRoom } = require('./server');

class Game {
  static instances = {};
  static instanceCounter = 0;

  constructor(hostPlayer) {
    this.socketRoomId = ++Game.instanceCounter;
    this.hostPlayer = hostPlayer;
    this.guestPlayer = null;
    this.startTime = new Date();
    this.ended = false;
    this.join(this.hostPlayer, false);
    this.hostPlayer.socket.on('gameStateUpdated', (data) => {
      broadcastToRoom(this.socketRoomId, 'gameStateUpdated', data);
    });
    Game.instances[this.socketRoomId] = this;
  }

  join(player, isGuestPlayer = true) {
    if (this.ended) return;
    if (isGuestPlayer && !this.guestPlayer) {
      this.guestPlayer = player;
    }
    player.registerStartedGame();
    player.socket.join(this.socketRoomId);

    player.socket.on('resetCue', (data) => {
      broadcastToRoom(this.socketRoomId, 'resetCue', data);
    });
    player.socket.on('fireCue', (data) => {
      broadcastToRoom(this.socketRoomId, 'fireCue', data);
    });
    player.socket.on('setTargetDirection', (data) => {
      broadcastToRoom(this.socketRoomId, 'setTargetDirection', data);
    });
  }

  leave(player) {
    player.socket.leave(this.socketRoomId);
    if (player === this.hostPlayer) this.end(); // TODO: notify guest if host is gone
  }

  async end() {
    if (this.ended) return;
    this.ended = true;

    const durationSecs = Math.floor((Date.now() - this.startTime) / 1000);
    await Promise.all([
      this.hostPlayer.registerWin(), // TODO
      this.guestPlayer ? this.guestPlayer.registerLoss() : Promise.resolve(), // TODO
      GameCollection.add({
        socketRoomId: this.socketRoomId,
        startTime: this.startTime.toISOString(),
        hostPlayer: this.hostPlayer.reference,
        guestPlayer: this.guestPlayer && this.guestPlayer.reference,
        durationSecs,
        winner: this.hostPlayer.reference, // TODO
      }).catch(e => console.error('Error adding new game to db:', e)),
    ]);

    console.log(`Game #${this.socketRoomId} ended after ${durationSecs} seconds.`);
  }
}

module.exports = Game;
