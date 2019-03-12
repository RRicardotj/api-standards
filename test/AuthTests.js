/* eslint-env node, mocha */
const AuthController = require('../controllers/AuthController/Services/AuthController');
const UserController = require('../controllers/UserController/Services/UserController');
const User = require('../models/User');
const Session = require('../models/Session');
const sequelize = require('../common/connection');

const language = process.env.TESTING_LANGUAGE;

sequelize.options.logging = false;

const { expect, should } = require('chai');

describe('AUTH TEST', async () => {
  const userController = new UserController(User, language);
  const authController = new AuthController(User, language);

  it('Create user', async () => {
    const name = 'autTEST';
    const email = 'authTest@test.com';
    const isEnabled = true;

    const instance = await userController.storeUser(name, email, isEnabled);
    // console.log(instance);
    expect(instance.name).to.equal(name);
    expect(instance.email).to.equal(email);
    expect(instance.isEnabled).to.equal(isEnabled);
    // this.user = instance;
    // await userController.destroy({ where: { id: instance.id } });
    // await userController.destroy({ where: { id: this.user.id } });
    this.userAuth = instance;
  });

  it('Login test', async () => {
    const browserDetails = {
      browser: { name: 'TEST', version: '1' },
      ipAddress: '127.0.0.1',
    };
    const response = await authController
      .signIn(this.userAuth.email, this.userAuth.plainPassword, browserDetails);

    should().exist(response.token);
  });


  after(async () => {
    await sequelize.transaction(async (t) => {
      await Session.destroy({ where: { userId: this.userAuth.id }, transaction: t });
      await User.destroy({ where: { id: this.userAuth.id }, transaction: t });
    });
  });
});
