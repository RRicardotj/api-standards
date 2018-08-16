

module.exports = {
  up(queryInterface, Sequelize) {
    const tableFields = {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Grant id',
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Grant name',
      },
      group: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Grant group',
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Grant description',
      },
      code: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
        comment: 'Grant code',
      },
      menu: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'Grant menu',
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

    return queryInterface.createTable('grants', tableFields);
  },

  down(queryInterface) {
    return queryInterface.dropTable('grants');
  },
};
