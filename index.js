require('dotenv').config();
require('./common/configure');
const config = require('./config/server');
const jwtAuth = require('./middlewares/jwtAuth');
const bodyParser = require('body-parser');
const express = require('express');

const app = express();
const server = require('http').Server(app);
require('./socket').init(server, { cookie: false });

app.use(bodyParser.urlencoded({
  extended: true,
}));

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  next();
});

app.use(jwtAuth);

app.use(require('./routes'));

server.listen(config.port);
console.log(`Listening on port ${config.port}`); // eslint-disable-line
