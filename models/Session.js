const sequelize = require('../common/connection');
const Sequelize = require('sequelize');

const fields = {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  ipAddress: {
    type: Sequelize.STRING(14),
    allowNull: false,
  },
  browser: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false,
  },
};

const model = sequelize.define('sessions', fields);


model.getSessions = (userId, from, to, count, limit, offset, transaction) => {
  let query = `SELECT ${count ? 'SQL_CALC_FOUND_ROWS' : ''}
  createdAt, updatedAt, browser, ipAddress,
  (ROUND(
      (
        UNIX_TIMESTAMP(updatedAt) - UNIX_TIMESTAMP(createdAt)
      ) / 60,
      0
    ) ) AS minutes
  FROM sessions`;

  if (userId || (from && to)) { query += ' WHERE'; }

  if (userId) { query += ' userId = :userId'; }

  if (userId && from && to) { query += ' AND'; }

  if (from && to) { query += ' createdAt BETWEEN :from AND :to'; }

  if (limit) { query += ' LIMIT :limit'; }
  if (limit && offset) { query += ' OFFSET :offset'; }

  return sequelize
    .query(
      query,
      {
        replacements: {
          userId,
          limit,
          offset,
          from,
          to,
        },
        type: sequelize.QueryTypes.SELECT,
        transaction,
      },
    );
};

model.foundRows = transaction => sequelize
  .query('SELECT FOUND_ROWS() total', { type: sequelize.QueryTypes.SELECT, transaction });

module.exports = model;
