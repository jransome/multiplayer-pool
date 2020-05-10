const admin = require('firebase-admin');
const serviceAccount = require('../firebaseSecrets.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://multiplayer-pool.firebaseio.com'
});

const db = admin.firestore();

// const playerCollection = db.collection('players');

// playerCollection.get().then(d => console.log('got data!', d.docs[0].data()))


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
  gameCollection: db.collection('games'),
  playerCollection: db.collection('players'),
};
