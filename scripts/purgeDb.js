const { GameCollection, PlayerCollection } = require('../src/database');

const deleteAll = (collection) => collection
  .listDocuments()
  .then(docs => Promise.all(docs.map(doc => doc.delete())))
  .then(() => console.log(collection.path, 'purged'))
  .catch(e => console.error(`Failed to purge ${collection.path}:`, e));

deleteAll(GameCollection);
deleteAll(PlayerCollection);
