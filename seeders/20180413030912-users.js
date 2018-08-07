
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
      },
      {
        name: 'Admin1',
        email: '1admin@admin.com',
        password: hashedPassword,
        isEnabled: 1,
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
