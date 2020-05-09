const admin = require('firebase-admin');
const serviceAccount = require('../firebaseSecrets.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://multiplayer-pool.firebaseio.com'
});

const db = admin.firestore();

const playerCollection = db.collection('players');

// playerCollection.get().then(d => console.log('got data!', d.docs[0].data()))

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
    this.documentReference.update({
      timePlayedSecs: admin.firestore.FieldValue.increment(sessionLengthSecs),
    });
  }
}

//  Player.createIfNotExists('Picard').then(j => {
// console.log(j)
//    setTimeout(() => j.logout(), 8000);
//  })


// const createIfNotExists = async (playerName) => {
//   const playerDocumentReference = playerCollection.doc(playerName);
//   if ((await playerDocumentReference.get()).exists) return playerDocumentReference;

//   await playerDocumentReference.create({
//     name: playerName,
//     gamesStarted: 0,
//     gamesAbandoned: 0,
//     gamesWon: 0,
//     timePlayedSecs: 0,
//   }).catch(e => console.error('Error on player document creation:', e));
//   return playerDocumentReference;
// }



module.exports = {
  Player,
};
