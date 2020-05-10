const { gameCollection } = require('./database');

class Game {
  static idCounter = 0;

  constructor(hostPlayer, hostSocket, socketServer) {
    this.socketServer = socketServer;
    this.id = ++Game.idCounter;
    this.startTime = null;
    this.duration = null;
    this.hostPlayer = hostSocket;
    this.guestPlayer = null;
    this.inProgress = false;
    this.ended = false;

    this.documentReference = null;
  }

  async start() {
    this.join(hostSocket, false);
    this.inProgress = true;
    this.startTime = new Date().toISOString()
    this.documentReference = await gameCollection.add({
      startTime:this.startTime,
      
    });
  }

  join(socket, isGuestPlayer = true) {
    if (!this.inProgress) return;
    if (isGuestPlayer && !this.guestPlayer) {
      this.guestPlayer = socket;
    }
    socket.join(this.id);

    socket.on('gameStateUpdated', (data) => {
      this._broadcast('gameStateUpdated', data);
    });
    socket.on('resetCue', (data) => {
      this._broadcast('resetCue', data);
    });
    socket.on('fireCue', (data) => {
      this._broadcast('fireCue', data);
    });
    socket.on('setTargetDirection', (data) => {
      this._broadcast('setTargetDirection', data);
    });
  }

  leave(socket) {
    socket.leave(this.id);
    if (socket === this.hostPlayer) this.end(); // TODO: notify guest if host is gone
    if (socket === this.guestPlayer) this.guestPlayer = null;
  }

  end() {
    this.duration = Date.now() - new Date(this.startTime);
    this.ended = true;
    console.log(this.id, 'ended. Duration:', this.duration);
  }

  _broadcast(eventName, data) {
    this.socketServer.to(this.id).emit(eventName, data);
  }
}

module.exports = Game;
