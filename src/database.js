const admin = require('firebase-admin');
const serviceAccount = require('../firebaseSecrets.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://multiplayer-pool.firebaseio.com'
});

const db = admin.firestore();

const playerCollection = db.collection('players');

// playerCollection.get().then(d => console.log('got data!', d.docs[0].data()))

const createIfNotExists = async (name) => {
  const playerDocumentReference = await playerCollection.where('name', '==', name).limit(1).get().then(({ docs }) => docs[0]);
  if (playerDocumentReference) return playerDocumentReference;

  return playerCollection.add({
    name,
    gamesStarted: 0,
    gamesAbandoned: 0,
    gamesWon: 0,
    timePlayedSecs: 0,
  });
}



// createIfNotExists('Kirk').then(record => console.log(record));
createIfNotExists('Picard').then(record => console.log(record));

// playerCollection.

module.exports = {

};
