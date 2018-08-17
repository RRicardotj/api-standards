

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('roles', [
      {
        name: 'Administrador',
        createdAt: '2017-05-25 02:45:14',
        updatedAt: '2017-05-25 02:45:14',
      },
      {
        name: 'Usuario',
        createdAt: '2017-05-25 02:45:14',
        updatedAt: '2017-05-25 02:45:14',
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
