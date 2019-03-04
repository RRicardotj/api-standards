const express = require('express');

const router = express.Router();

// Signin
router.post('/signin', withCatchAsync(singIn));

// Change Password
router.post('/password', withCatchAsync(passwordChange));

// Check token
router.get('/check', withCatchAsync(checkHandler));


module.exports = router;
