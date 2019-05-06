/* eslint-disable func-names */
const companies = require('./mongodb/collections/companies');
const MongoClient = require('./mongodb/client');

const test = async () => {
  const Company = await companies();

  // await Company.connect();

  // Get first two documents that match the query
  const docs = await Company.find().limit(2).toArray();

  console.dir(docs[0]);

  await MongoClient.close();
};

test();
