const express = require('express');

const router = express.Router();
const grant = require('../middlewares/grant');
const withCatchAsync = require('../common/catchAsyncErrors');
const DeleteHelper = require('../common/DeleteHelper');
const Validator = require('../common/validator');
const RoleUser = require('../models/RoleUser');
const isAdmin = require('../middlewares/isAdmin');

/**
 * @return {Object} rules
 */
function getValidationRules() {
  return {
    rules: {
      roleId: 'required|integer|exists:roles,id',
      regionId: 'required|integer|exists:regions,id',
    },
  };
}
/**
 * Definition: Store region
 * - operationId: RGN_STO
 * @param {Request} req
 * @param {Response} res
 * @returns {Object} instance of region created
 */
const storeHandle = async (req, res) => {
  const data = req.only('roleId', 'regionId');
  data.userId = req.params.id;

  const isValid = await Validator.validateAsync(data, getValidationRules());

  if (isValid !== true) { return res.errorValidation(isValid); }

  const instance = await RoleUser.create(data);

  return res.json(instance);
};
/**
 * Definition: Destroy RolesUsers
 * operationId: ROL_DES
 * @param {Request} req
 * @param {Response} res
 */
const deleteHandle = async (req, res) => {
  await DeleteHelper.tryToDelete(req.params.id, 'roles__users');
  return res.json({ id: parseInt(req.params.id, 10) });
};

// Region store
router.post('/user/:id(\\d+)/role', isAdmin, grant('RGN_MANAGE'), withCatchAsync(storeHandle));
// Destroy
router.delete('/:id(\\d+)/', isAdmin, grant('RGN_MANAGE'), withCatchAsync(deleteHandle));

module.exports = router;
