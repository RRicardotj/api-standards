const Log = require('../models/Log');

const logger = async (req) => {
  await Log.bulkCreate(req.logs);
  return undefined;
};

module.exports = logger;
