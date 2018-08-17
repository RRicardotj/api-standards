const express = require('express');

const router = express.Router();

const Grants = require('../models/Grants');
const Validator = require('../common/validator');
const withCatchAsync = require('../common/catchAsyncErrors');
const grant = require('../middlewares/grant');
const isAdmin = require('../middlewares/isAdmin');

/**
 * @return {Object} rules
 */
function getValidationRules() {
  return {
    titles: {
    },
    rules: {
      grants: 'required|array|exists_recursive:grants,code',
    },
    messages: {},
  };
}

/**
 * Definition: View all grants
 * - summary: List of all grants
 * - operationId: GRNT_VIEW
 * @param {Request} req
 * @param {Response} res
 * @returns {Array} instances of grants
 */
const indexHandler = async (req, res) => {
  const instances = await Grants.index();
  return res.json(instances);
};

/**
 * Definition validate grants
 * operationId: GRNT_CHCK
 * @param {Request} req
 * @param {Response} res
 * @returns {Array} valid grants
 */
const validateGrants = async (req, res) => {
  const data = req.only('grants');

  const isValid = await Validator.validateAsync(data, getValidationRules());

  if (isValid !== true) { return res.errorValidation(isValid); }

  const instances = await Grants.checkCode(req.userId, data.grants);

  const result = {};
  for (let i = 0; i < instances.length; i += 1) {
    result[instances[i]] = true;
  }

  return res.json(result);
};

// Grant index
router.get('/', grant('GRNT_VIEW'), withCatchAsync(indexHandler));

router.post('/', isAdmin, withCatchAsync(validateGrants));

module.exports = router;
