const sequelize = require('./connection');
const ErrorLogic = require('./ErrorLogic');

const exist = (id, tableName, transaction) => new Promise((resolve, reject) => {
  sequelize
    .query(
      `SELECT COUNT(1) total FROM ${tableName} WHERE id = :id`,
      {
        replacements: { id: parseInt(id, 10) },
        type: sequelize.QueryTypes.SELECT,
        transaction,
      },
    )
    .then(result => resolve(result[0].total))
    .catch((err) => {
      reject(err);
    });
});

const toDelete = (id, tableName, transaction) => sequelize.query(
  `DELETE FROM ${tableName} WHERE id = :id`,
  {
    replacements: { id: parseInt(id, 10) },
    type: sequelize.QueryTypes.DELETE,
    transaction,
  },
);

module.exports.tryToDelete = async (objectId, tableName, transaction) => {
  const exists = await exist(objectId, tableName, transaction);

  if (!exists) { throw new ErrorLogic('NOT_FOUND'); }

  try {
    await toDelete(objectId, tableName, transaction);
  } catch (error) {
    switch (error.name) {
      case 'SequelizeForeignKeyConstraintError':
      { throw new ErrorLogic('El elemento esta en uso'); }
      default:
      { throw new ErrorLogic('No se pudo eliminar el elemento'); }
    }
  }
};
