const { GameCollection } = require('./database');
const { broadcastToRoom } = require('./server');

class Game {
  static instances = {};
  static instanceCounter = 0;

  constructor(hostPlayer) {
    this.socketRoomId = ++Game.instanceCounter;
    this.playersPresent = new Set();
    this.hostPlayer = hostPlayer;
    this.guestPlayer = null;
    this.winner = null;
    this.startTime = new Date();
    this.ended = false;
    this.join(this.hostPlayer, false);
    this.hostPlayer.socket.on('gameStateUpdated', (data) => {
      broadcastToRoom(this.socketRoomId, 'gameStateUpdated', data);
    });
    Game.instances[this.socketRoomId] = this;
  }

  join(player, isGuestPlayer = true) {
    if (this.ended || !this.playersPresent.has(this.hostPlayer)) return;
    this.playersPresent.add(player);
    if (isGuestPlayer && !this.guestPlayer) {
      this.guestPlayer = player;
    }
    player.registerStartedGame();
    player.socket.join(this.socketRoomId);
    broadcastToRoom(this.socketRoomId, 'playerListingUpdated', [...this.playersPresent].map(p => p.name));

    player.socket.on('resetCue', (data) => {
      broadcastToRoom(this.socketRoomId, 'resetCue', data);
    });
    player.socket.on('fireCue', (data) => {
      broadcastToRoom(this.socketRoomId, 'fireCue', data);
    });
    player.socket.on('setTargetDirection', (data) => {
      broadcastToRoom(this.socketRoomId, 'setTargetDirection', data);
    });
    player.socket.on('claimWin', () => {
      broadcastToRoom(this.socketRoomId, 'victoryClaimed', player.name);
      this.claimWin(player);
    });
  }

  leave(player) {
    player.socket.leave(this.socketRoomId);
    this.playersPresent.delete(player);
    broadcastToRoom(this.socketRoomId, 'playerListingUpdated', [...this.playersPresent].map(p => p.name));
    if (this.playersPresent.size === 0) this.end(); // TODO: notify guest if host is gone
  }

  claimWin(player) {
    if (this.winner) return;
    this.winner = player;
    console.log(`${player.name} claimed victory for game #${this.socketRoomId} (${this.hostPlayer.name}'s game)`);
    this.end();
  }

  async end() {
    if (this.ended) return;
    this.ended = true;

    const durationSecs = Math.floor((Date.now() - this.startTime) / 1000);
    await Promise.all([
      ...this.winner ? [
        this.hostPlayer.registerGameResult(this.winner === this.hostPlayer),
        this.guestPlayer.registerGameResult(this.winner === this.guestPlayer),
      ] : [Promise.resolve()],
      GameCollection.add({
        socketRoomId: this.socketRoomId,
        startTime: this.startTime.toISOString(),
        hostPlayer: this.hostPlayer.reference,
        guestPlayer: this.guestPlayer && this.guestPlayer.reference,
        winner: this.winner && this.winner.reference,
        durationSecs,
      }).catch(e => console.error('Error adding new game to db:', e)),
    ]);

    console.log(`Game #${this.socketRoomId} ended after ${durationSecs} seconds.`);
  }
}

module.exports = Game;
