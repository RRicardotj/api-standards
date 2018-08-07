

module.exports = {
  up(queryInterface, Sequelize) {
    const tableFields = {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: 'User id',
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'The user personal name',
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'The user email address, this is useful in login',
      },
      password: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'The user password',
      },
      isEnabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        comment: 'The user is or not enabled',
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

    return queryInterface.createTable('users', tableFields);
  },

  down(queryInterface) {
    return queryInterface.dropTable('users');
  },
};
