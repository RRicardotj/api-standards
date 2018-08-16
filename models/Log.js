const sequelize = require('../common/connection');
const Sequelize = require('sequelize');

const fields = {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true,
    primaryKey: true,
    autoIncrement: true,
  },
  event: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  userId: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  entityType: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  entityId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
  },
};

const model = sequelize.define('logs', fields);

module.exports = model;
