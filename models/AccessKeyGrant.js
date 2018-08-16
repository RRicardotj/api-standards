const sequelize = require('../common/connection');
const Sequelize = require('sequelize');

const fields = {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true,
    primaryKey: true,
    autoIncrement: true,
  },
  accessKeyId: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'access_keys',
      key: 'id',
    },
  },
  grantId: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'grants',
      key: 'id',
    },
  },
};
const model = sequelize.define('access_keys__grants', fields, { timestamps: false });

module.exports = model;
