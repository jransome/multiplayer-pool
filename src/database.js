const admin = require('firebase-admin');
const serviceAccount = require('../firebaseSecrets.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://multiplayer-pool.firebaseio.com',
});

const db = admin.firestore();

module.exports = {
  GameCollection: db.collection('games'),
  PlayerCollection: db.collection('players'),
  helpers: {
    incrementField: (amount) => admin.firestore.FieldValue.increment(amount),
  },
};
