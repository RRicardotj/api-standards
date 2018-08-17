const socketio = require('socket.io');
const socketioJwt = require('socketio-jwt');
const Widget = require('./models/Widget');

let io = null;
const sockets = {};

const bootServer = () => {
  const nsp = io.of('/');

  nsp.use(socketioJwt.authorize({
    secret: process.env.KEY_APP,
    handshake: true,
  }));

  nsp.on('connection', async (socket) => {
    console.log('NEW CONNECTION');

    const userWidgets = await Widget.getByUser(socket.decoded_token.user);

    for (let i = 0; i < userWidgets.length; i += 1) {
      socket.join(userWidgets[i].code);
    }
  });

  sockets.init = nsp;
};

const boot = (server, options) => {
  io = socketio(server, options || {});
  bootServer();
};

const realtime = {
  init(server, options) {
    boot(server, options || {});
  },

  get(key) {
    return sockets[key];
  },
};

module.exports = realtime;
