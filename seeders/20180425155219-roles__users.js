

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('roles__users', [
      {
        userId: 1,
        roleId: 1,
      },
      {
        userId: 2,
        roleId: 2,
      },
      {
        userId: 1,
        roleId: 2,
      },
    ], {});
  },

  down() {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
  },
};
