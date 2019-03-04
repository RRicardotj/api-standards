const express = require('express');

const router = express.Router();
const withCatchAsync = require('../../common/catchAsyncErrors');
const { signInHandler, passwordChangeHandler } = require('./Services');

const checkHandler = async (req, res) => (res.json({ isValid: true }));

// Signin
router.post('/signin', withCatchAsync(signInHandler));

// Change Password
router.post('/password', withCatchAsync(passwordChangeHandler));

// Check token
router.get('/check', withCatchAsync(checkHandler));


module.exports = router;
