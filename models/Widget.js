const sequelize = require('../common/connection');
const Sequelize = require('sequelize');

const fields = {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  code: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  zone: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  default: {
    type: Sequelize.BOOLEAN,
    allowNull: true,
  },
};

const model = sequelize.define('widgets', fields);

model.getByUser = (userId, widgetCode) => sequelize
  .query(
    `SELECT w.id, w.code, w.zone, w.title, wu.position, COALESCE(wu.isEnabled,w.default) isEnabled
    FROM
    (SELECT w.*
          from roles__users ru
        JOIN grants__roles gr ON gr.roleId = ru.roleId
        JOIN grants__widgets gw ON gw.grantId = gr.grantId
        JOIN widgets w ON w.id = gw.widgetId
    WHERE ru.userId = :userId
    GROUP BY w.code) w
    LEFT JOIN widgets__users wu ON w.id = wu.widgetId AND wu.userId = :userId
    ${widgetCode ? 'WHERE w.code = :widgetCode' : ''}
    ORDER BY wu.position ASC`,
    {
      type: sequelize.QueryTypes.SELECT,
      replacements: { userId, widgetCode },
    },
  );

model.isOwner = (userId, widgetIds) => sequelize
  .query(
    `SELECT CASE
    WHEN COUNT(*) > 0 THEN 1
    ELSE 0 END AS isOwner
  from roles__users ru
      JOIN grants__roles gr ON gr.roleId = ru.roleId
      JOIN grants__widgets gw ON gw.grantId = gr.grantId
      JOIN widgets w ON w.id = gw.widgetId
      LEFT JOIN widgets__users wu ON wu.userId = ru.userId
      WHERE ru.userId = :userId AND w.id in (:widgetIds)`,
    {
      type: sequelize.QueryTypes.SELECT,
      replacements: { userId, widgetIds },
    },
  ).then(result => result[0].isOwner === 1);

model.index = () => sequelize
  .query(
    'SELECT * FROM widgets',
    { type: sequelize.QueryTypes.SELECT },
  );

const findAndUpdate = async (object) => {
  await sequelize.query(
    'UPDATE widgets SET zone = :zone, title = :title, `default` = :default WHERE code = :code',
    {
      type: sequelize.QueryTypes.UPDATE,
      replacements: {
        code: object.code,
        zone: object.zone,
        title: object.title,
        default: object.default,
      },
    },
  );
  const result = await sequelize.query(
    'SELECT code, id FROM widgets WHERE code = :code',
    {
      type: sequelize.QueryTypes.SELECT,
      replacements: { code: object.code },
    },
  );
  return result[0];
};

const insertWidget = async (object) => {
  await sequelize.query(
    'INSERT INTO widgets (code, zone, title, `default`) VALUES (:code, :zone, :title, :default)',
    {
      type: sequelize.QueryTypes.UPDATE,
      replacements: {
        code: object.code,
        zone: object.zone,
        title: object.title,
        default: object.default,
      },
    },
  );

  const result = await sequelize.query(
    'SELECT code, id FROM widgets WHERE code = :code',
    {
      type: sequelize.QueryTypes.SELECT,
      replacements: { code: object.code },
    },
  );
  return result[0];
};

model.seed = async (objectArray) => {
  if (!Array.isArray(objectArray)) { return {}; }

  const widgets = {};

  let instances = await model.index();

  const promises = objectArray.map(async (widget) => {
    for (let i = 0; i < instances.length; i += 1) {
      if (instances[i].code === widget.code) {
        return findAndUpdate(widget);
      }
    }
    return insertWidget(widget);
  });

  await Promise.all(promises);

  instances = await model.index();

  for (let i = 0; i < instances.length; i += 1) {
    const item = instances[i];
    widgets[item.code] = {
      id: item.id,
      accessKeys: objectArray[i].accessKeys,
    };
  }

  return widgets;
};

model.getDataByCode = async (widgetCode, userId) => {
  if (!userId) { return undefined; }

  const widget = await model.findOne({ where: { code: widgetCode }, attributes: ['id'] });

  if (!widget) { return undefined; }

  const isOwn = await model.isOwner(userId, widget.id);

  if (!isOwn) { return undefined; }

  if (widgetCode === '') {
    return undefined;
  }

  return undefined;
};

module.exports = model;
