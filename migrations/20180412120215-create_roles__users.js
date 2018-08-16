

module.exports = {
  up(queryInterface, Sequelize) {
    const tableFields = {
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

    return queryInterface.createTable('roles__users', tableFields);
  },

  down(queryInterface) {
    return queryInterface.dropTable('roles__users');
  },
};
