const connection = require('../connection');

module.exports = async () => {
  const db = await connection();
  const collectionName = 'companies';

  const collection = db.collection(collectionName);

  return collection;
};
