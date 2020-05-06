const admin = require('firebase-admin');
const serviceAccount = require('./firebaseSecrets.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://multiplayer-pool.firebaseio.com'
});

const db = admin.firestore();

db.collection('users').get().then(d => console.log('got data!', d.docs[0].data()))

// module.exports = admin.firestore();
