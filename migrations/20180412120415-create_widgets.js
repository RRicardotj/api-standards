module.exports = {
  up(queryInterface, Sequelize) {
    const tableFields = {
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

    return queryInterface.createTable('widgets', tableFields);
  },

  down(queryInterface) {
    return queryInterface.dropTable('widgets');
  },
};
