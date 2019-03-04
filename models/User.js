const sequelize = require('../common/connection');
const Sequelize = require('sequelize');
const randomstring = require('randomstring');

const fields = {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: 'User id',
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    comment: 'The user personal name',
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    comment: 'The user email address, this is useful in login',
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
    comment: 'The user password',
  },
  isEnabled: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    comment: 'The user is or not enabled',
  },
  language: {
    type: Sequelize.STRING(2),
    allowNull: false,
    defaultValue: 'es',
  },
};

const model = sequelize.define('users', fields);

model.index = () => sequelize
  .query(
    `SELECT us.id, us.name, us.isEnabled, email, COUNT(ru.roleId) roles from users us
    LEFT JOIN roles__users ru on ru.userId = us.id
    GROUP BY us.id ORDER BY us.id`,
    { type: sequelize.QueryTypes.SELECT },
  );

model.getRandomPassword = () => randomstring.generate({ length: 6, charset: 'numeric' });

model.haveRegionalGrant = async (userId, accessKeyCode, regionId) => {
  const count = await sequelize.query(
    `SELECT  IF(g.needRegional and COUNT(acc.code)>0,1,0)result FROM roles__users ru
    JOIN roles rol ON ru.roleId = rol.id
    JOIN grants__roles gr ON gr.roleId = rol.id
    JOIN grants g ON g.id = gr.grantId
    JOIN access_keys__grants accG ON accG.grantId = g.id
    JOIN access_keys acc ON acc.id = accG.accessKeyId
    WHERE ru.userId =:userId AND acc.code =:accessKeyCode and ru.regionId =:regionId`,
    {
      type: sequelize.QueryTypes.SELECT,
      replacements: { userId, accessKeyCode, regionId },
    },
  );
  // console.log("COUNT***",count[0].result);
  return count[0].result;
};

model.hasAccess = async (userId, accessKeyCode) => {
  const count = await sequelize.query(
    `SELECT COUNT(acc.code) total FROM users us
    JOIN roles__users ru ON us.id = ru.userId
    LEFT JOIN roles rol ON ru.roleId = rol.id
    LEFT JOIN grants__roles gr ON gr.roleId = rol.id
    LEFT JOIN grants g ON g.id = gr.grantId 
    LEFT JOIN access_keys__grants accG ON accG.grantId = g.id
    LEFT JOIN access_keys acc ON acc.id = accG.accessKeyId
    WHERE us.id = :userId AND acc.code = :accessKeyCode`,
    {
      type: sequelize.QueryTypes.SELECT,
      replacements: { accessKeyCode, userId },
    },
  );

  return count[0].total > 0;
};

model.getRolesByUser = userId => sequelize
  .query(
    `SELECT ru.id, ro.id roleId, ro.name rolName, re.name regionName 
    from roles__users ru
    LEFT JOIN roles ro on ro.id = ru.roleId
    LEFT JOIN regions re on re.id = ru.regionId
    WHERE ru.userId = :userId`,
    {
      type: sequelize.QueryTypes.SELECT,
      replacements: { userId },
    },
  );

model.findUserAdministrators = () => sequelize
  .query(
    `SELECT DISTINCT userId, roleId
    FROM roles__users
    WHERE roleId = (SELECT id FROM roles WHERE name = 'Administrador')`,
    {
      type: sequelize.QueryTypes.SELECT,
    },
  );

model.getMenu = async (id) => {
  const menu = await sequelize
    .query(
      `SELECT gra.menu 
      FROM roles__users ru
      JOIN grants__roles gr ON gr.roleId = ru.roleId
      JOIN grants gra ON gra.id = gr.grantId
      WHERE ru.userId = :id
      GROUP BY gra.menu`,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      },
    );
  return menu.map(item => item.menu);
};

model.getGrants = userId => sequelize.query(
  `SELECT g.id, g.description, g.name, g.group
    FROM roles__users rs
    LEFT JOIN grants__roles gr ON rs.roleId = gr.roleId
    LEFT JOIN grants g ON gr.grantId = g.id
  WHERE rs.userId = :userId AND g.id IS NOT NULL`,
  {
    type: sequelize.QueryTypes.SELECT,
    replacements: { userId },
  },
);

module.exports = model;
