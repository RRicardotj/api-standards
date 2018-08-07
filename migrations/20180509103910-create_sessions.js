module.exports = {
  up(queryInterface, Sequelize) {
    const tableFields = {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      ipAddress: {
        type: Sequelize.STRING(14),
        allowNull: false,
      },
      browser: {
        type: Sequelize.STRING,
        allowNull: false,
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

    return queryInterface.createTable('sessions', tableFields);
  },

  down(queryInterface) {
    return queryInterface.dropTable('sessions');
  },
};
