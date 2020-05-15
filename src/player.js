const { PlayerCollection, helpers } = require('./database');

class Player {
  static instances = new Set();
  static isAlreadyLoggedIn(name){
    return [...Player.instances].some(p => p.name === name);
  }

  static async createIfNotExists(name, socket) {
    const playerDocumentReference = await PlayerCollection
      .where('name', '==', name)
      .limit(1)
      .get()
      .then(({ docs: [doc] }) => doc && doc.ref)
      .catch(e => console.error('Error checking db for player', name, e));
    if (playerDocumentReference) return new Player(playerDocumentReference, name, socket);

    return new Player(await PlayerCollection.add({
      name,
      gamesStarted: 0,
      gamesWon: 0,
      gamesLost: 0,
      timeLoggedOnSecs: 0,
      leaderBoardVisible: false,
    }).catch(e => console.error('Error creating new player', name, e)), name, socket);
  }

  constructor(documentReference, name, socket) {
    this.documentReference = documentReference;
    this.name = name;
    this.socket = socket;
    this.loginTime = Date.now();
    Player.instances.add(this);
  }

  get reference() {
    return this.documentReference.path;
  }

  registerStartedGame() {
    return this.documentReference.update({
      gamesStarted: helpers.incrementField(1),
    }).catch(e => console.error('Error updating db on player start for player', this.name, e));
  }

  registerGameResult(isWinner) {
    return this.documentReference.update({
      [isWinner ? 'gamesWon' : 'gamesLost']: helpers.incrementField(1),
    }).catch(e => console.error('Error updating db on player game result for player', this.name, e));
  }

  logout() {
    const timeSinceLoginSecs = Math.floor((Date.now() - this.loginTime) / 1000);
    this.documentReference.update({
      timeLoggedOnSecs: helpers.incrementField(timeSinceLoginSecs),
    }).catch(e => console.error('Error updating db on player logout for player', this.name, e));

    Player.instances.delete(this);
    console.log(`${this.name} logged out. Players still logged in: ${[...Player.instances].map(p => p.name).join(', ')} (${Player.instances.size})`);
  }
}

module.exports = Player;
