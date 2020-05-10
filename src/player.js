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
      gamesAbandoned: 0,
      gamesWon: 0,
      timePlayedSecs: 0,
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

  async logout() {
    const sessionLengthSecs = Math.floor((Date.now() - this.loginTime) / 1000);
    await this.documentReference.update({
      timePlayedSecs: helpers.incrementField(sessionLengthSecs),
    }).catch(e => console.error('Error updating db on player logout for player', this.name, e));
  }
}

module.exports = Player;
