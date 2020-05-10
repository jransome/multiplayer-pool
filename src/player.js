const { PlayerCollection, helpers } = require('./database');

class Player {
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
    }).catch(e => console.error('Error creating new player', name, e)), name, socket);
  }

  constructor(documentReference, name, socket) {
    this.documentReference = documentReference;
    this.name = name;
    this.socket = socket;
    this.loginTime = Date.now();
  }

  get reference() {
    return this.documentReference.path;
  }

  registerStartedGame() {
    return this.documentReference.update({
      gamesStarted: helpers.incrementField(1),
    }).catch(e => console.error('Error updating db on player start for player', this.name, e));
  }

  registerWin() {
    return this.documentReference.update({
      gamesWon: helpers.incrementField(1),
    }).catch(e => console.error('Error updating db on player win for player', this.name, e));
  }

  registerLoss() {
    return this.documentReference.update({
      gamesLost: helpers.incrementField(1),
    }).catch(e => console.error('Error updating db on player loss for player', this.name, e));
  }

  logout() {
    const sessionLengthSecs = Math.floor((Date.now() - this.loginTime) / 1000);
    this.documentReference.update({
      timeLoggedOnSecs: helpers.incrementField(sessionLengthSecs),
    }).catch(e => console.error('Error updating db on player logout for player', this.name, e));
  }
}

module.exports = Player;
