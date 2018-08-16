const sequelize = require('../common/connection');
const Sequelize = require('sequelize');
const Promise = require('bluebird');

const fields = {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true,
    primaryKey: true,
    autoIncrement: true,
    comment: 'AccessKey id',
  },
  name: {
    type: Sequelize.STRING(100),
    allowNull: false,
    comment: 'AccessKey name',
  },
  code: {
    type: Sequelize.STRING(30),
    allowNull: false,
    unique: true,
    comment: 'AccessKey code',
  },
};


const model = sequelize.define('access_keys', fields);

model.index = () => sequelize
  .query(
    'SELECT id, name, code FROM access_keys',
    { type: sequelize.QueryTypes.SELECT },
  );

const findAndUpdate = async (object) => {
  await sequelize.query(
    'UPDATE access_keys SET name = :name WHERE code = :code',
    {
      type: sequelize.QueryTypes.UPDATE,
      replacements: { name: object.name, code: object.code },
    },
  );
  const result = await sequelize.query(
    'SELECT code, id FROM access_keys WHERE code = :code',
    {
      type: sequelize.QueryTypes.SELECT,
      replacements: { code: object.code },
    },
  );
  return result[0];
};

const insertAccessKey = async (name, code) => {
  await sequelize.query(
    'INSERT INTO access_keys (name, code) VALUES (:name, :code)',
    {
      type: sequelize.QueryTypes.UPDATE,
      replacements: { name, code },
    },
  );
  const result = await sequelize.query(
    'SELECT code, id FROM access_keys WHERE code = :code',
    {
      type: sequelize.QueryTypes.SELECT,
      replacements: { code },
    },
  );
  return result[0];
};


model.seed = async (objectArray) => {
  if (!Array.isArray(objectArray)) { return {}; }

  const accessKeys = {};

  let instances = await model.index();

  const promises = objectArray.map(async (accessKey) => {
    for (let i = 0; i < instances.length; i += 1) {
      if (instances[i].code === accessKey.code) {
        return findAndUpdate(accessKey);
      }
    }
    return insertAccessKey(accessKey.name, accessKey.code);
  });

  await Promise.all(promises);

  instances = await model.index();

  for (let i = 0; i < instances.length; i += 1) {
    const item = instances[i];
    accessKeys[item.code] = item.id;
  }

  return accessKeys;
};


module.exports = model;
