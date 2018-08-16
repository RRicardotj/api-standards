module.exports = {
  up(queryInterface, Sequelize) {
    const tableFields = {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        primaryKey: true,
        autoIncrement: true,
      },
      event: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      entityType: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      entityId: {
        type: Sequelize.INTEGER,
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

    return queryInterface.createTable('logs', tableFields);
  },

  down(queryInterface) {
    return queryInterface.dropTable('logs');
  },
};
