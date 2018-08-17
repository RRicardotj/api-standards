const express = require('express');

const router = express.Router();
const Widget = require('../models/Widget');
const withCatchAsync = require('../common/catchAsyncErrors');
// const grant = require('../middlewares/grant');
const Validator = require('../common/validator');
const Promise = require('bluebird');
const WidgetUser = require('../models/WidgetUser');
const ErrorLogic = require('../common/ErrorLogic');
const isAdmin = require('../middlewares/isAdmin');

/**
 * @return {Object} rules
 */
function getValidationRules() {
  return {
    rules: {
      widgetId: 'required|array|exists_recursive:widgets,id',
    },
  };
}


/**
 * Definition: Get users widgets
 * operationId: WGT_IND
 * @param {Request} req
 * @param {Response} res
 * @return {Object} res.json({ zoneA, zoneB })
 */
const widgetsbyZones = async (req, res) => {
  const widgets = await Widget.getByUser(req.userId);

  const dataPromises = widgets.map((widget) => {
    if (widget.isEnabled) {
      return Widget.getDataByCode(widget.code, req.userId);
    }
    return undefined;
  });

  const results = await Promise.all(dataPromises);

  for (let i = 0; i < widgets.length; i += 1) {
    results.forEach((result) => {
      if (result && result[widgets[i].code]) { widgets[i].data = result[widgets[i].code]; }
    });
  }

  // console.log({ zoneA: responsea, zoneB: responseb });
  // return res.json({ zoneA: responsea, zoneB: responseb });
  return res.json(widgets);
};

/**
 * Definition: Set widget order
 * operationId: WGT_ORD
 * @param {Request} req
 * @param {Response} res
 * @return {Object} { result: 'OK' }
 */
const widgetsOrder = async (req, res) => {
  const widgetId = req.body.widgets.map(widget => widget.id);

  const isValid = await Validator.validateAsync({ widgetId }, getValidationRules());

  const isOwner = await Widget.isOwner(req.userId, widgetId);

  if (!isOwner) { throw new ErrorLogic('Un widget no corresponde al usuario'); }

  if (isValid !== true) { return res.errorValidation(isValid); }

  // const response = [];
  const promises = await req.body.widgets.map(async (widget) => {
    const data = {
      widgetId: widget.id,
      userId: req.userId,
      position: widget.position,
      isEnabled: widget.isEnabled,
    };
    // response.push(data);
    const widgetUser = await WidgetUser.findOne({
      where: { widgetId: widget.id, userId: req.userId },
    });

    if (widgetUser) {
      return WidgetUser.update({ position: widget.position, isEnabled: data.isEnabled }, {
        where: { widgetId: widget.id, userId: req.userId },
      });
    }

    return WidgetUser.create(data);
  });

  await Promise.all(promises);

  return res.json({ result: 'OK' });
};

/**
 * Definition:: Get widget data by code
 * operationId: WGT_DAT
 * @param {Request} req
 * @param {Response} res
 * @returns widget data
 */
const widgetData = async (req, res) => {
  const widgets = await Widget.getByUser(req.userId, req.params.code);

  if (widgets.length === 0) { throw new ErrorLogic('El widget no corresponde al usuario'); }

  const widget = widgets[0];

  const data = await Widget.getDataByCode(req.params.code, req.userId);

  return res.json(data[widget.code]);
};

router.get('/', isAdmin, withCatchAsync(widgetsbyZones));

router.post('/order', isAdmin, withCatchAsync(widgetsOrder));

router.post('/:code', isAdmin, withCatchAsync(widgetData));

module.exports = router;
