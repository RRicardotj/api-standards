

module.exports = {
  up(queryInterface, Sequelize) {
    const tableFields = {
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
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    };

    return queryInterface.createTable('grants__roles', tableFields);
  },

  down(queryInterface) {
    return queryInterface.dropTable('grants__roles');
  },
};
