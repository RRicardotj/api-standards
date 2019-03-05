const Handler = require('../../Handler');
const Session = require('../../../models/Session');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthController extends Handler {
  constructor(model, lenguage) {
    super(model, lenguage);

    this.signIn = this.signIn.bind(this);
    this.passwordChange = this.passwordChange.bind(this);
  }

  async signIn(email, password, browserDetail) {
    const user = await this.findOne({
      where: { email },
      attributes: ['id', 'email', 'password', 'isEnabled', 'name'],
    });

    if (!user) { throw new this.CustomError(this.getMessage(this.LITERALS.CREDENTIALS_IVALID)); }

    if (!user.isEnabled) {
      throw new this.CustomError(this.getMessage(this.LITERALS.USER_DISABLED));
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) { throw new this.CustomError(this.getMessage(this.LITERALS.CREDENTIALS_IVALID)); }

    const { browser } = browserDetail;
    const { ipAddress } = browserDetail;

    const sessionData = {
      browser: `${browser.name} ${browser.version}`,
      userId: user.id,
      ipAddress,
      createdAt: this.moment.tz(new Date(), process.env.TZ).format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: this.moment.tz(new Date(), process.env.TZ).format('YYYY-MM-DD HH:mm:ss'),
    };

    const session = await Session.create(sessionData);

    const token = jwt.sign({ user: user.id, session: session.id, type: 'admin' }, process.env.KEY_APP, { expiresIn: '12h' });

    return { user: user.name, email: user.email, token };
  }

  async passwordChange(userId, currentPassword, newPassword) {
    const user = await this.findOne({
      where: { id: userId },
      attributes: ['id', 'password', 'email', 'language'],
    });

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      throw new this
        .CustomError(this.getMessage(this.LITERALS.CREDENTIALS_IVALID, user.language), 401);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await user.update({ password: hashedPassword });

    return { message: this.getMessage(this.LITERALS.PASSWORD_CHANGED) };
  }
}

module.exports = AuthController;
