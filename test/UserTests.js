/* eslint-env node, mocha */
const UserController = require('../controllers/UserController/Services/UserController');
const User = require('../models/User');
const sequelize = require('../common/connection');

const language = process.env.TESTING_LANGUAGE;

sequelize.options.logging = false;

const { expect, should } = require('chai');

/* function checkValue(testValue, expectedResult) {
  const result = fizzBuzz(testValue);
  expect(result).to.equal(expectedResult);
}
*/

describe('USER CRUD', async () => {
  const userController = new UserController(User, language);

  /*beforeEach(async () => {
    const name = 'MyNameTest';
    const email = 'my_email.test@test.com';
    const isEnabled = true;

    const instance = await userController.storeUser(name, email, isEnabled);
    this.user = instance;
  });*/

  it('Create user', async () => {
    const name = 'MyNameTestCreate';
    const email = 'my_email.test_create@test.com';
    const isEnabled = true;

    const instance = await userController.storeUser(name, email, isEnabled);
    // console.log(instance);
    expect(instance.name).to.equal(name);
    expect(instance.email).to.equal(email);
    expect(instance.isEnabled).to.equal(isEnabled);
    // this.user = instance;
    // await userController.destroy({ where: { id: instance.id } });
    // await userController.destroy({ where: { id: this.user.id } });
    this.user = instance;
  });

  it('Update User', async () => {
    const name = 'MyNameTestEdit';
    const email = 'my_email.test_edit@test.com';
    const isEnabled = false;

    const instance = await userController.updateUser(this.user.id, name, email, isEnabled);

    expect(instance.name).to.equal(name);
    expect(instance.email).to.equal(email);
    expect(instance.isEnabled).to.equal(isEnabled);
    // this.user = instance;
    // await userController.destroy({ where: { id: instance.id } });
    // await userController.destroy({ where: { id: this.user.id } });
  });


  it('Destroy user tested', async () => {
    await User.destroy({ where: { id: this.user.id } });
    const destroyed = await User.findById(this.user.id);
    should().not.exist(destroyed);
  });

  after(() => (sequelize.close()));
});

/*
const assert = require('assert');

describe('Array', () => {
  describe('#indexOf()', () => {
    it('should return -1 when the value is not present', () => {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});

*/

// sequelize.close();
