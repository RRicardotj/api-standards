const express = require('express');

const router = express.Router();
const withCatchAsync = require('../../common/catchAsyncErrors');
const {
  indexHandler,
  getSessionsHandler,
  storeHandler,
  updateHandler,
  updatePasswordHandler,
} = require('./Services');


// Index
router.get('/', withCatchAsync(indexHandler));

router.get('/:id(\\d+)/sessions', withCatchAsync(getSessionsHandler));

// Store
router.post('/', withCatchAsync(storeHandler));

// Update
router.put('/:id(\\d+)/', withCatchAsync(updateHandler));

// Update
router.put('/:id(\\d+)/password', withCatchAsync(updatePasswordHandler));

module.exports = router;
