const { GameCollection, helpers } = require('./database');

class Game {
  static instanceCounter = 0;

  constructor(hostPlayer, socketServer) {
    this.socketRoomId = ++Game.instanceCounter;
    this.socketServer = socketServer;
    this.startTime = null;
    this.hostPlayer = hostPlayer;
    this.guestPlayer = null;
    this.inProgress = false;
    this.documentReference = null;
  }

  async start() {
    this.join(this.hostPlayer, false);
    this.hostPlayer.socket.on('gameStateUpdated', (data) => {
      this._broadcast('gameStateUpdated', data);
    });

    this.startTime = new Date();
    this.documentReference = await GameCollection.add({
      socketRoomId: this.socketRoomId,
      startTime: this.startTime.toISOString(),
      hostPlayer: this.hostPlayer.reference,
      guestPlayer: '',
      inProgress: true,
      durationSecs: 0,
    }).catch(e => console.error('Error on adding new game:', e));
    this.inProgress = true;
  }

  join(player, isGuestPlayer = true) {
    if (!this.inProgress) return;
    if (isGuestPlayer && !this.guestPlayer) {
      this.guestPlayer = player;
      this.documentReference.update({
        guestPlayer: player.reference,
      }).catch(e => console.error('Error on updating guest player:', e));
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
    // if (player === this.guestPlayer) this.guestPlayer = null;
  }

  end() {
    if (!this.inProgress) return;
    this.inProgress = false;

    const duration = Math.floor((Date.now() - this.startTime) / 1000);
    this.documentReference.update({
      durationSecs: helpers.incrementField(duration),
      inProgress: false,
    }).catch(e => console.error('Error on updating game ended:', e));

    console.log('Game', this.socketRoomId, 'ended. Duration:', duration, 'seconds');
  }

  _broadcast(eventName, data) {
    this.socketServer.to(this.socketRoomId).emit(eventName, data);
  }
}

module.exports = Game;
