const express = require('express');

const router = express.Router();

router.use('/auth', require('./controllers/AuthController'));
router.use('/user', require('./controllers/UserController'));

router.get('/', (req, res) => {
  res.send('API SERVER UP');
});

router.use((err, req, res, next) => { // eslint-disable-line
  res.handleReject(err);
});

module.exports = router;
