

module.exports = {
  up(queryInterface, Sequelize) {
    const tableFields = {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
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
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    };

    return queryInterface.createTable('access_keys__grants', tableFields);
  },

  down(queryInterface) {
    return queryInterface.dropTable('access_keys__grants');
  },
};
