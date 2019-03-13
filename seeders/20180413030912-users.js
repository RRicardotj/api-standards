
const bcrypt = require('bcryptjs');

module.exports = {
  up(queryInterface) {
    const plainPassword = 'admin';
    const hashedPassword = bcrypt.hashSync(plainPassword, 10);
    return queryInterface.bulkInsert('users', [
      {
        name: 'Admin',
        email: 'admin@admin.com',
        password: hashedPassword,
        isEnabled: 1,
        createdAt: '2017-05-25 02:45:14',
        updatedAt: '2017-05-25 02:45:14',
        language: 'es',
      },
      {
        name: 'Admin2',
        email: '2admin@admin.com',
        password: hashedPassword,
        isEnabled: 1,
        createdAt: '2017-05-25 02:45:14',
        updatedAt: '2017-05-25 02:45:14',
        language: 'en',
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
