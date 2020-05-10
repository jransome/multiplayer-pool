const { GameCollection } = require('./database');

class Game {
  static instances = {};
  static instanceCounter = 0;

  constructor(hostPlayer, socketServer) {
    this.socketServer = socketServer;
    this.socketRoomId = ++Game.instanceCounter;
    this.hostPlayer = hostPlayer;
    this.guestPlayer = null;
    this.startTime = new Date();
    this.inProgress = true;
    this.join(this.hostPlayer, false);
    this.hostPlayer.socket.on('gameStateUpdated', (data) => {
      this._broadcast('gameStateUpdated', data);
    });
    Game.instances[this.socketRoomId] = this;
  }

  join(player, isGuestPlayer = true) {
    if (!this.inProgress) return;
    if (isGuestPlayer && !this.guestPlayer) {
      this.guestPlayer = player;
    }
    player.socket.join(this.socketRoomId);

    player.socket.on('resetCue', (data) => {
      this._broadcast('resetCue', data);
    });
    player.socket.on('fireCue', (data) => {
      this._broadcast('fireCue', data);
    });
    player.socket.on('setTargetDirection', (data) => {
      this._broadcast('setTargetDirection', data);
    });
  }

  leave(player) {
    player.socket.leave(this.socketRoomId);
    if (player === this.hostPlayer) this.end(); // TODO: notify guest if host is gone
  }

  async end() {
    if (!this.inProgress) return;
    this.inProgress = false;

    const durationSecs = Math.floor((Date.now() - this.startTime) / 1000);
    await GameCollection.add({
      socketRoomId: this.socketRoomId,
      startTime: this.startTime.toISOString(),
      hostPlayer: this.hostPlayer.reference,
      guestPlayer: this.guestPlayer && this.guestPlayer.reference,
      durationSecs,
      winner: this.hostPlayer.reference, // TODO
    }).catch(e => console.error('Error on adding new game:', e));

    console.log('Game', this.socketRoomId, 'ended. Duration:', durationSecs, 'seconds');
  }

  _broadcast(eventName, data) {
    this.socketServer.to(this.socketRoomId).emit(eventName, data);
  }
}

module.exports = Game;
