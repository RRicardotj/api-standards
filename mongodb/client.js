const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
// Database Name
const client = new MongoClient(url, { useNewUrlParser: true });

module.exports = client;
