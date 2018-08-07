const configDb = require('../config/db');
const Sequelize = require('sequelize');
const Promise = require('bluebird');

const cn = new Sequelize(configDb.database, configDb.username, configDb.password, {
  host: configDb.host,
  dialect: configDb.dialect,
  timezone: configDb.timezone,
  operatorsAliases: false,
});

cn.getValue = (table, id, field) => new Promise((resolve, reject) => {
  cn
    .query(
      `SELECT ${field} FROM ${table} WHERE id = :id limit 1`,
      {
        replacements: { id },
        type: cn.QueryTypes.SELECT,
      },
    )
    .then((result) => {
      // console.log(result);
      resolve(result.length ? result[0][field] : null);
    })
    .catch(err => reject(err));
});

module.exports = cn;
