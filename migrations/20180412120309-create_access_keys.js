

module.exports = {
  up(queryInterface, Sequelize) {
    const tableFields = {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        primaryKey: true,
        autoIncrement: true,
        comment: 'AccessKey id',
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'AccessKey name',
      },
      code: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
        comment: 'AccessKey code',
      },
    };

    return queryInterface.createTable('access_keys', tableFields);
  },

  down(queryInterface) {
    return queryInterface.dropTable('access_keys');
  },
};
