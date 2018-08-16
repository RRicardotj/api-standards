const sequelize = require('../common/connection');
const Sequelize = require('sequelize');

const fields = {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  roleId: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'roles',
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
const model = sequelize.define('grants__roles', fields);

model.index = () => sequelize
  .query(
    'SELECT id, grantId, roleId FROM `grants__roles`',
    { type: sequelize.QueryTypes.SELECT },
  );

model.getGrantsByRole = roleId => sequelize
  .query(
    `SELECT grantId 
    FROM grants__roles
    WHERE roleId = :roleId`,
    {
      type: sequelize.QueryTypes.SELECT,
      replacements: { roleId },
    },
  );

model.resetSuperAdminGrants = async () => {
  await sequelize
    .query(
      `DELETE FROM grants__roles 
      WHERE roleId = (SELECT id FROM roles WHERE name = 'Administrador')`,
      {
        type: sequelize.QueryTypes.DELETE,
      },
    );
  await sequelize
    .query(
      `INSERT INTO grants__roles
        SELECT null, (SELECT id FROM roles WHERE name = 'Administrador'), g.id, NOW(), NOW() 
        FROM grants g `,
      {
        type: sequelize.QueryTypes.INSERT,
      },
    );
  return true;
};

module.exports = model;
