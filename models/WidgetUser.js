const sequelize = require('../common/connection');
const Sequelize = require('sequelize');

const fields = {
  id: {
    primaryKey: true,
    type: Sequelize.INTEGER.UNSIGNED,
    autoIncrement: true,
  },
  widgetId: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'widgets',
      key: 'id',
    },
  },
  userId: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  position: {
    type: Sequelize.INTEGER,
  },
  isEnabled: {
    type: Sequelize.BOOLEAN,
    allowNull: true,
  },
};
const model = sequelize.define('widgets__users', fields);

module.exports = model;
