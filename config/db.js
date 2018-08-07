const dotenv = require('dotenv');

if (!process.env.DB_NAME) {
  dotenv.config();
}

module.exports = {
//  url: `mysql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}`,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  dialect: 'mysql',
  timezone: '-04:00',
};
