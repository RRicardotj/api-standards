const sequelize = require('../common/connection');
const Sequelize = require('sequelize');
const Grant = require('./Grants');
const GrantRole = require('./GrantRole');

const fields = {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true,
    primaryKey: true,
    autoIncrement: true,
    comment: 'Role id',
  },
  name: {
    type: Sequelize.STRING(15),
    allowNull: false,
    comment: 'Role name',
  },
};

const model = sequelize.define('roles', fields);

model.getValue = (id, field) => sequelize.getValue('roles', id, field);

model.index = () => sequelize
  .query(
    `SELECT r.id, r.name, gr.grantId FROM roles r
    LEFT JOIN grants__roles gr on gr.roleId = r.id`,
    { type: sequelize.QueryTypes.SELECT },
  );

model.roleGrants = id => sequelize
  .query(
    `SELECT g.id, g.name, g.description
    FROM grants__roles gr
    LEFT JOIN grants g ON gr.grantId = g.id
    WHERE gr.roleId = :id`,
    {
      type: sequelize.QueryTypes.SELECT,
      replacements: { id },
    },
  );

model.dropdown = () => sequelize
  .query(
    'SELECT name label, id value FROM roles ORDER BY name',
    {
      type: sequelize.QueryTypes.SELECT,
    },
  );

model.getGrantsId = async (id) => {
  const grantsId = await sequelize
    .query(
      `SELECT g.id
        FROM grants g
        JOIN grants__roles gr ON gr.grantId = g.id
        WHERE gr.roleId = :id`,
      {
        type: sequelize.QueryTypes.SELECT,
        replacements: { id },
      },
    );
  return grantsId.map(item => item.id);
};

model.getUsersByRole = roleId => sequelize
  .query(
    `SELECT DISTINCT ru.id, ru.roleId, u.name userName
    FROM roles__users ru
    JOIN users u on u.id = ru.userId
    WHERE ru.roleId = :roleId`,
    {
      type: sequelize.QueryTypes.SELECT,
      replacements: { roleId },
    },
  );

model.belongsToMany(Grant, { through: GrantRole });

model.hasMany(GrantRole, { onDelete: 'cascade', hooks: true });

module.exports = model;
