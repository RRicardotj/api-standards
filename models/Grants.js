const sequelize = require('../common/connection');
const Sequelize = require('sequelize');
const AccessKeyGrant = require('./AccessKeyGrant');
const AccessKey = require('./AccessKey');


const fields = {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: 'Grant id',
  },
  name: {
    type: Sequelize.STRING(50),
    allowNull: false,
    comment: 'Grant name',
  },
  group: {
    type: Sequelize.STRING(50),
    allowNull: false,
    comment: 'Grant group',
  },
  description: {
    type: Sequelize.STRING(255),
    allowNull: false,
    comment: 'Grant description',
  },
  code: {
    type: Sequelize.STRING(30),
    allowNull: false,
    unique: true,
    comment: 'Grant code',
  },
  menu: {
    type: Sequelize.STRING(20),
    allowNull: false,
    comment: 'Grant menu',
  },
};

const model = sequelize.define('grants', fields);

model.index = () => sequelize
  .query(
    'SELECT id, code, name, description, needRegional, `group` FROM grants',
    { type: sequelize.QueryTypes.SELECT },
  );

model.belongsToMany(AccessKey, { through: AccessKeyGrant });


model.checkCode = async (userId, codes) => {
  const code = await sequelize
    .query(
      `SELECT gra.code 
          FROM grants gra
        JOIN grants__roles gr ON gr.grantId = gra.id 
        JOIN roles__users ru ON ru.roleId = gr.roleId
        WHERE code in (:codes) AND ru.userId= :userId
        GROUP BY gra.code`,
      {
        replacements: { userId, codes },
        type: sequelize.QueryTypes.SELECT,
      },
    );
  return code.map(item => item.code);
};

const findAndUpdate = async (object) => {
  await sequelize.query(
    'UPDATE grants SET name = :name, menu = :menu, description = :description, `group` = :group WHERE code = :code',
    {
      type: sequelize.QueryTypes.UPDATE,
      replacements: {
        name: object.name,
        code: object.code,
        menu: object.menu,
        description: object.description,
        group: object.group,
      },
    },
  );
  const result = await sequelize.query(
    'SELECT code, id FROM grants WHERE code = :code',
    {
      type: sequelize.QueryTypes.SELECT,
      replacements: { code: object.code },
    },
  );
  return result[0];
};

const resetGrantAccessKeys = async (grantId, accessKeysId) => {
  await sequelize
    .query(
      `DELETE FROM access_keys__grants 
      WHERE grantId = :grantId`,
      {
        type: sequelize.QueryTypes.DELETE,
        replacements: { grantId },
      },
    );
  await sequelize
    .query(
      `INSERT INTO access_keys__grants
        SELECT null, ak.id, :grantId, NOW(), NOW() FROM access_keys ak WHERE ak.id IN (${accessKeysId.join(',')});`,
      {
        type: sequelize.QueryTypes.INSERT,
        replacements: { grantId },
      },
    );
  return true;
};


const resetGrantWidgets = async (grantId, widgetId) => {
  await sequelize
    .query(
      `DELETE FROM grants__widgets 
      WHERE grantId = :grantId`,
      {
        type: sequelize.QueryTypes.DELETE,
        replacements: { grantId },
      },
    );
  await sequelize
    .query(
      `INSERT INTO grants__widgets
        SELECT null, :grantId, w.id, NOW(), NOW() FROM widgets w WHERE w.id IN (${widgetId.join(',')});`,
      {
        type: sequelize.QueryTypes.INSERT,
        replacements: { grantId },
      },
    );
  return true;
};

model.seed = async (grantsElements, accessKeys, widgets) => {
  if (!Array.isArray(grantsElements)) { return {}; }

  const grants = {};

  let instances = await model.index();

  const promises = grantsElements.map(async (grant) => {
    for (let i = 0; i < instances.length; i += 1) {
      if (instances[i].code === grant.code) {
        return findAndUpdate(grant);
      }
    }
    return model.create(grant);
  });

  await Promise.all(promises);

  instances = await model.index();

  const grantWidgetPromises = [];
  const grantAccessKeyPromises = [];


  for (let i = 0; i < grantsElements.length; i += 1) {
    const item = grantsElements[i];

    for (let k = 0; k < instances.length; k += 1) {
      const instance = instances[k];
      if (instance.code === item.code) { item.id = instance.id; break; }
    }

    grants[item.code] = item.id;

    const accessKeyId = [];
    for (let j = 0; j < grantsElements[i].accessKeys.length; j += 1) {
      if (accessKeys[grantsElements[i].accessKeys[j]]) {
        accessKeyId.push(accessKeys[grantsElements[i].accessKeys[j]]);
      } else {
        throw new Error(`El access Key ${grantsElements[i].accessKeys[j]} es invalido`);
      }
    }

    // widgets
    const widgetsId = [];
    for (let j = 0; j < grantsElements[i].widgets.length; j += 1) {
      if (widgets[grantsElements[i].widgets[j]]) {
        widgetsId.push(widgets[grantsElements[i].widgets[j]].id);

        for (let h = 0; h < widgets[grantsElements[i].widgets[j]].accessKeys.length; h += 1) {
          if (accessKeys[widgets[grantsElements[i].widgets[j]].accessKeys[h]]
            && accessKeyId.indexOf(widgets[grantsElements[i].widgets[j]].accessKeys[h]) < 0) {
            accessKeyId.push(accessKeys[widgets[grantsElements[i].widgets[j]].accessKeys[h]]);
          } else {
            throw new Error(`El access Key ${widgets[grantsElements[i].widgets[j]].accessKeys[h]} dentro del widget ${grantsElements[i].widgets[j]} es invalido`);
          }
        }
      } else {
        throw new Error(`El widget ${grantsElements[i].widgets[j]} es invalido`);
      }
    }

    if (widgetsId.length > 0) {
      grantWidgetPromises.push(resetGrantWidgets(item.id, widgetsId));
      // await resetGrantWidgets(item.id, widgetsId);
    }

    if (accessKeyId.length > 0) {
      // await resetGrantAccessKeys(item.id, accessKeyId);
      grantAccessKeyPromises.push(resetGrantAccessKeys(item.id, accessKeyId));
    }
  }

  await Promise.all(grantAccessKeyPromises);
  await Promise.all(grantWidgetPromises);

  return grants;
};

module.exports = model;
