const Handler = require('../../Handler');
const randomstring = require('randomstring');
const bcrypt = require('bcryptjs');
const sequelize = require('../../../common/connection');

/**
 * @return {String} random string generated
 */
function getRandomPassword() {
  return randomstring.generate({ length: 6, charset: 'numeric' });
}

class UserController extends Handler {
  constructor(model, language) {
    super(model, language);

    this.listUsers = this.listUsers.bind(this);
    this.getSessions = this.getSessions.bind(this);
    this.storeUser = this.storeUser.bind(this);
    this.updateUser = this.storeUser.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
  }

  listUsers() {
    return this.model.index();
  }

  async getSessions(userId, from, to, offset) {
    const response = await sequelize.transaction(async (t) => {
      const instances = await this.model
        .getSessions(userId, from, to, true, 10, offset, t);

      const total = await this.model.foundRows(t);
      const elements = total[0].total;
      let totalPages = Math.ceil(elements / 10);

      totalPages = (totalPages === 0 ? 1 : totalPages);

      return { rows: instances, totalPages };
    });
    return response;
  }

  async storeUser(name, email, isEnabled) {
    const plainPassword = getRandomPassword();

    const password = await bcrypt.hash(plainPassword, 10);

    let userInstance = await this.create({
      name, email, isEnabled, password,
    });

    userInstance = userInstance.toJSON();
    userInstance.plainPassword = plainPassword;
    return userInstance;
  }

  async updateUser(id, name, email, isEnabled) {
    let instance = await this.findById(id);

    if (!instance) { throw new this.CustomError(this.getMessage(this.LITERALS.NOT_FOUND)); }

    instance = await instance.update({ name, email, isEnabled });

    return instance;
  }

  async updatePassword(id) {
    const instance = await this.findById(id);

    if (!instance) { throw new this.CustomError(this.getMessage(this.LITERALS.NOT_FOUND)); }

    const plainPassword = getRandomPassword();

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    await instance.update({ password: hashedPassword });

    const item = instance.toJSON();
    item.plainPassword = plainPassword;

    return item;
  }
}

module.exports = UserController;
