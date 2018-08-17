const express = require('express');

const router = express.Router();
const Validator = require('../common/validator');
const Roles = require('../models/Roles');
// const RoleUser = require('../models/RoleUser');
const ErrorLogic = require('../common/ErrorLogic');
const grant = require('../middlewares/grant');
const withCatchAsync = require('../common/catchAsyncErrors');
const DeleteHelper = require('../common/DeleteHelper');
const isAdmin = require('../middlewares/isAdmin');
const logger = require('../middlewares/logger');
const moment = require('moment-timezone');

/**
 * @return {Object} rules
 */
function getValidationRules(id) {
  return {
    titles: {
    },
    rules: {
      name: `required|unique:roles,name,${id}`,
    },
    messages: {},
  };
}

/**
 * Definition: View all roles
 * - summary: List of all roles
 * - operationId: ROL_VIEW
 * @param {Request} req
 * @param {Response} res
 * @returns {Array} instances of regions
 */
const indexHandler = async (req, res) => {
  const response = [];
  let lastId = null;
  const instances = await Roles.index();

  for (let i = 0; i < instances.length; i += 1) {
    const grants = instances[i].grantId;
    if (lastId !== instances[i].id) {
      instances[i].grantId = [];
      response.push(instances[i]);
      lastId = instances[i].id;
    }
    if (grants) {
      response[response.length - 1].grantId.push(grants);
    }
  }
  return res.json(response);
};

/**
 * Definition: View role details
 * - operationId: ROL_VIEW_DET
 * @param {Request} req
 * @param {Response} res
 * @returns {Object} instance of role found
 */
const roleDetail = async (req, res) => {
  let instance = await Roles.findById(req.params.id, { attributes: { exclude: ['createdAt', 'updatedAt'] } });

  if (!instance) { throw new ErrorLogic('NOT_FOUND'); }

  instance = instance.toJSON();

  instance.grants = await Roles.roleGrants(instance.id);

  return res.json(instance);
};

/**
 * Definition: Store role
 * - operationId: ROL_STO
 * @param {Request} req
 * @param {Response} res
 * @returns {Object} instance of rol created
 */
const storeHandle = async (req, res, next) => {
  const data = req.only('name');

  const isValid = await Validator.validateAsync(data, getValidationRules());

  if (isValid !== true) { return res.errorValidation(isValid); }

  const instance = await Roles.create(data);

  req.logs = [
    {
      event: 'Roles, añadir',
      description: `El usuario ${req.userName} añadió el rol ${instance.name}`,
      entityType: 'roles',
      entityId: instance.id,
      userId: req.userId,
      createdAt: moment.tz(new Date(), process.env.TZ).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];
  res.json(instance);
  return next();
};

/**
 * Definition: Update role
 * - operationId: ROL_UPD
 * @param {Request} req
 * @param {Response} res
 * @returns {Object} instance of role updated
 */
const updateHanlde = async (req, res, next) => {
  const data = req.only('name');
  const isValid = await Validator.validateAsync(data, getValidationRules(req.params.id));

  if (isValid !== true) { return res.errorValidation(isValid); }

  let instance = await Roles.findById(req.params.id);

  if (!instance) { throw new ErrorLogic('NOT_FOUND'); }

  instance = await instance.update(data);

  req.logs = [
    {
      event: 'Roles, actualizar',
      description: `El usuario ${req.userName} actualizó el rol ${instance.name}`,
      entityType: 'roles',
      entityId: instance.id,
      userId: req.userId,
      createdAt: moment.tz(new Date(), process.env.TZ).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  res.json(instance);
  return next();
};

/**
 * Definition: Destroy Role
 * operationId: ROL_DES
 * @param {Request} req
 * @param {Response} res
 */
const deleteHandle = async (req, res, next) => {
  const instance = await Roles.findById(req.params.id);
  if (!instance) { throw new ErrorLogic('No se encotró el rol o ya ha sido eliminado'); }
  await DeleteHelper.tryToDelete(req.params.id, 'roles');

  req.logs = [
    {
      event: 'Roles, eliminar',
      description: `El usuario ${req.userName} eliminó el rol ${instance.name}`,
      entityType: 'roles',
      entityId: instance.id,
      userId: req.userId,
      createdAt: moment.tz(new Date(), process.env.TZ).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];
  res.json({ id: parseInt(req.params.id, 10) });
  return next();
};

/**
 * Definition: Dropdown Role
 * operationId: ROLE_DROPDOWN
 * @param {Request} req
 * @param {Response} res
 */
const dropdownHandler = async (req, res) => {
  const instances = await Roles.dropdown();
  return res.json(instances);
};

const getUsersByRole = async (req, res) => {
  const instances = await Roles.getUsersByRole(req.params.id);
  return res.json(instances);
};

/**
 * Definition: Set grants to Role
 * operationId: ROL_GRANT_UPD
 * @param {Request} req
 * @param {Response} res
 */
const setGrants = async (req, res, next) => {
  const instance = await Roles.findById(req.params.id);

  if (!instance) { throw new ErrorLogic('NOT_FOUND'); }

  const data = {
    grantId: req.body.grantId,
  };

  const rules = {
    rules: {
      grantId: 'array|exists_recursive:grants,id',
    },
  };

  const isValid = await Validator.validateAsync(data, rules);

  if (isValid !== true) { return res.errorValidation(isValid); }

  await instance.setGrants(data.grantId);

  const item = instance.toJSON();

  item.grantId = data.grantId;

  req.logs = [
    {
      event: 'Roles, modificar permisos',
      description: `El usuario ${req.userName} modificó los permisos del rol ${instance.name}`,
      entityType: 'roles',
      entityId: instance.id,
      userId: req.userId,
      createdAt: moment.tz(new Date(), process.env.TZ).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  res.json(item);
  return next();
};

// Index
router.get('/', isAdmin, grant('ROL_VIEW'), withCatchAsync(indexHandler));

router.get('/:id(\\d+)', isAdmin, grant('ROL_VIEW_SHO'), withCatchAsync(roleDetail));

// Store
router.post('/', isAdmin, grant('ROL_MANAGE'), withCatchAsync(storeHandle), logger);

// Update
router.put('/:id(\\d+)/', isAdmin, grant('ROL_MANAGE'), withCatchAsync(updateHanlde), logger);

// Destroy
router.delete('/:id(\\d+)/', isAdmin, grant('ROL_MANAGE'), withCatchAsync(deleteHandle), logger);

// Dropdown
router.get('/dropdown', isAdmin, grant('ROL_DROP'), withCatchAsync(dropdownHandler));

router.put('/:id(\\d+)/grants', isAdmin, grant('ROL_GRANT_UPD'), withCatchAsync(setGrants), logger);

router.get('/:id(\\d+)/users', isAdmin, grant('ROL_USR_GET'), withCatchAsync(getUsersByRole));

module.exports = router;
