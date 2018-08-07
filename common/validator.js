const Validator = require('validatorjs');
const sequelize = require('./connection');
const Promise = require('bluebird');
const moment = require('moment-timezone');

// Query functions

function getDefaultMessages() {
  return (
    {
      required: 'Campo requerido',
      regex: 'Formato inválido',
    });
}


function getQueryExists(val, attribute) {
  let value = val;
  const attr = attribute.split(',');

  const customId = attr[1].split(':');

  let q = `SELECT 1 FROM ${attr[0]} WHERE `;

  if (customId.length === 1) {
    q += `${attr[1]} = :value `;
  } else {
    const key = 1;
    value = customId[key];
    q += `${customId[0]} = :value `;
  }

  const replacements = {
    value,
  };

  for (let i = 2; (i + 1) < attr.length; i += 2) {
    switch (attr[i + 1]) {
      case 'IS_NULL':
        q += `AND ${attr[i]} IS NULL `;
        break;
      case 'IS_NOT_NULL':
        q += `AND ${attr[i]} IS NOT NULL `;
        break;
      default: {
        let operator = attr[i + 1].substr(0, 2);
        if (['>=', '<='].indexOf(operator) > -1) {
          q += `AND ${attr[i]} ${operator} ${attr[i + 1].substr(2)} `;
          break;
        }

        operator = attr[i + 1].substr(0, 1);
        if (['>', '<'].indexOf(operator) > -1) {
          q += `AND ${attr[i]} ${operator} ${attr[i + 1].substr(1)} `;
          break;
        }

        q += `AND ${attr[i]} = ${attr[i + 1]} `;
        break;
      }
    }
  }

  q += 'LIMIT 1';

  return { q, replacements };
}

/**
 * validate with moment.js if date have a valid format
 * @param {DATE} date dated to validate
 * @param {String} format valid format
 * @return {Boolean} true if date is valid, otherwise false
 */
function isDateValid(date, format) {
  // return moment(date, format).isValid();
  return moment.tz(date, format, true, process.env.TZ).isValid();
}

Validator.isDateValid = isDateValid;

// Configuration
Validator.useLang('es');

Validator.setAttributeFormatter(attribute =>
  attribute.charAt(0).toUpperCase() + attribute.slice(1));

// New Validators
Validator.registerAsync('unique', (value, attribute, req, passes) => {
  const replacements = {
    value,
  };

  const attr = attribute.split(',');


  let q = `SELECT 1 FROM ${attr[0]} WHERE ${attr[1]} = :value`;

  if (attr[2] && attr[2] !== 'undefined') {
    const field = (attr[3] && attr[3] !== 'undefined' ? attr[3] : 'id');
    q += ` AND ${field} != :id`;
    const idIndex = 2;
    replacements.id = attr[idIndex];
  }

  q += ' LIMIT 1';

  sequelize.query(
    q,
    {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    },
  ).then((result) => {
    if (result.length) {
      passes(false);
    } else {
      passes();
    }
  });
}, 'Ya existe');

Validator.registerAsync('exists', (value, attribute, req, passes) => {
  const params = getQueryExists(value, attribute);

  sequelize.query(
    params.q,
    {
      replacements: params.replacements,
      type: sequelize.QueryTypes.SELECT,
    },
  ).then((result) => {
    if (result.length) {
      passes();
    } else {
      passes(false);
    }
  });
}, 'No existe');

Validator.registerAsync('exists_recursive', (value, attribute, req, passes) => {
  if (!(value instanceof Array)) { return passes(false); }

  const promises = value.map((item) => {
    const p = getQueryExists(item, attribute);
    return sequelize.query(p.q, {
      replacements: p.replacements,
      type: sequelize.QueryTypes.SELECT,
    });
  });

  Promise
    .all(promises)
    .then((result) => {
      for (let i = 0; i < value.length; i += 1) {
        if (!result[i].length) {
          return passes(false);
        }
      }
      return passes();
    });
  return undefined;
}, 'No válido');

Validator.register('isBefore', (value, attribute) => {
  const attributeValues = attribute.split(',');

  const day = attributeValues[0];

  const format = attributeValues[1] || 'YYYY-MM-DD';

  let dateToCompare;

  if (!isDateValid(value, format)) { return false; }

  const todayDate = moment.tz(new Date(), process.env.TZ).format(format);
  switch (day) {
    case 'TODAY': {
      // date isBefore today?
      dateToCompare = todayDate;
      break;
    }
    case 'TOMORROW': {
      // date isBefore tomorrow?
      dateToCompare = moment(todayDate).add(1, 'days').format(format);
      break;
    }
    case 'YESTERDAY': {
      // date isBefore yesterday?
      dateToCompare = moment(todayDate).subtract(1, 'days').format(format);
      break;
    }
    default:
      if (!isDateValid(day, format)) { return false; }

      dateToCompare = moment.tz(new Date(day), process.env.TZ).format(format);
      break;
  }

  return moment(value).isBefore(dateToCompare);
}, 'Fecha no válida');

Validator.register('isAfter', (value, attribute) => {
  const attributeValues = attribute.split(',');

  const day = attributeValues[0];

  const format = attributeValues[1] || 'YYYY-MM-DD';

  let dateToCompare;

  if (!isDateValid(value, format)) { return false; }

  const todayDate = moment.tz(new Date(), process.env.TZ).format(format);

  switch (day) {
    case 'TODAY':
      // date isAfter today?
      dateToCompare = todayDate;
      break;
    case 'TOMORROW':
      // date isAfter tomorrow?
      dateToCompare = moment(todayDate).add(1, 'days').format(format);
      break;
    case 'YESTERDAY':
      // date isAfter yesterday?
      dateToCompare = moment(todayDate).subtract(1, 'days').format(format);
      break;
    default:
      if (!isDateValid(day, format)) { return false; }

      dateToCompare = moment.tz(new Date(day), process.env.TZ).format(format);
      break;
  }

  return moment(value).isAfter(dateToCompare);
}, 'Fecha no válida');

Validator.register('validDateFormat', (value, attribute) => {
  const format = attribute || 'YYYY-MM-DD';
  return isDateValid(value, format);
}, 'Fecha no válida');

// Custom functions
Validator.generate = (data, parms) => {
  const v = new Validator(data, parms.rules, parms.messages);
  // v.setAttributeNames(parms.titles)
  // v.stopOnError(true)
  return v;
};

Validator.firstError = (validator) => {
  // console.log(validator.errors.all());
  const firstAttribute = Object.keys(validator.errors.all()).shift();
  return validator.errors.first(firstAttribute);
};

Validator.firstByField = (validator) => {
  const errors = validator.errors.all();
  Object.keys(errors).forEach((key) => {
    const keyIndex = 0;
    errors[key] = errors[key][keyIndex];
  });

  return errors;
};

Validator.validateAsync = (data, parms, returnAll = true) => new Promise((resolve) => {
  const messages = Object.assign(getDefaultMessages(), parms.messages);
  const v = new Validator(data, parms.rules, messages);
  v.checkAsync(
    () => resolve(true),
    () => resolve(returnAll ? Validator.firstByField(v) : Validator.firstError(v)),
  );
});

module.exports = Validator;
