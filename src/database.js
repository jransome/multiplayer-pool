const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
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
