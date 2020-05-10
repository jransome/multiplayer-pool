const { playerCollection } = require('./database');

class Player {
  static async createIfNotExists(name) {
    const playerDocumentReference = await playerCollection
      .where('name', '==', name)
      .limit(1)
      .get()
      .then(({ docs: [doc] }) => doc && doc.ref);
    if (playerDocumentReference) return new Player(playerDocumentReference);

    return new Player(await playerCollection.add({
      name,
      gamesStarted: 0,
      gamesAbandoned: 0,
      gamesWon: 0,
      timePlayedSecs: 0,
    }));
  }

  constructor(documentReference) {
    this.documentReference = documentReference;
    this.loginTime = Date.now();
  }

  async logout() {
    const sessionLengthSecs = Math.floor((Date.now() - this.loginTime) / 1000);
    await this.documentReference.update({
      timePlayedSecs: admin.firestore.FieldValue.increment(sessionLengthSecs),
    });
  }
}

module.exports = Player;
