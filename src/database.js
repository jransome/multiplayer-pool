const admin = require('firebase-admin');

const serviceAccount = {
  type: 'service_account',
  project_id: 'multiplayer-pool',
  private_key_id: process.env.DB_PRIVATE_KEY_ID,
  private_key: process.env.DB_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.DB_CLIENT_EMAIL,
  client_id: process.env.DB_CLIENT_ID,
  auth_uri: process.env.DB_AUTH_URI,
  token_uri: process.env.DB_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.DB_AUTH_PROVIDER_URL,
  client_x509_cert_url: process.env.DB_CLIENT_CERT_URL,
}

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
