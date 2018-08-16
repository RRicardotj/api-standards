const sequelize = require('../common/connection');
const Sequelize = require('sequelize');

const Op = Sequelize.Op; // eslint-disable-line

const fields = {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: 'Role user id',
  },
  userId: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'User id, foreign key',
  },
  roleId: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'roles',
      key: 'id',
    },
    comment: 'Role id, foreign key',
  },
};

const model = sequelize.define('roles__users', fields, { timestamps: false });

model.existsRoleInRoleUser = roleId => sequelize
  .query(
    `SELECT 
                  COUNT(1) conteo 
                FROM roles__users
                WHERE roleId = :roleId`,
    {
      replacements: { roleId },
      type: sequelize.QueryTypes.SELECT,
    },
  );

model.exists = (userId, roleId, regionId = null) =>
  model.findOne({
    where: {
      userId: { [Op.eq]: userId },
      roleId: { [Op.eq]: roleId },
      regionId: { [Op.eq]: regionId },
    },
    attributes: ['id'],
  });
module.exports = model;
