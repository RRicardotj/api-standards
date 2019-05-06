const client = require('./client');

module.exports = async () => {
  const dbName = 'crunchbase';
  await client.connect();

  const db = client.db(dbName);

  return db;
};
