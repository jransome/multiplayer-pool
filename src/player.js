const { PlayerCollection, helpers } = require('./database');

class Player {
  static async createIfNotExists(name, socket) {
    const playerDocumentReference = await PlayerCollection
      .where('name', '==', name)
      .limit(1)
      .get()
      .then(({ docs: [doc] }) => doc && doc.ref);
    if (playerDocumentReference) return new Player(playerDocumentReference, socket);

    return new Player(await PlayerCollection.add({
      name,
      gamesStarted: 0,
      gamesAbandoned: 0,
      gamesWon: 0,
      timePlayedSecs: 0,
    }), socket);
  }

  constructor(documentReference, socket) {
    this.documentReference = documentReference;
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
    });
  }
}

module.exports = Player;
