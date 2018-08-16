

module.exports = {
  up(queryInterface, Sequelize) {
    const tableFields = {
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
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Creation date',
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Updating date',
      },
    };

    return queryInterface.createTable('roles', tableFields);
  },

  down(queryInterface) {
    return queryInterface.dropTable('roles');
  },
};
