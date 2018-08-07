const express = require('express');
const ErrorLogic = require('./ErrorLogic');

express.request.only = function only() {
  const data = {};

  for (let i = 0; i < arguments.length; i += 1) {
    data[arguments[i]] = this.body[arguments[i]]; // eslint-disable-line
  }

  return data;
};

express.response.error = function handleError(error, status = 403, path) {
  // Change response on case of check token path
  if (path === '/auth/check') {
    return this.json({ isValid: false });
  }
  return this.status(status).json({ error });
};

express.response.errorValidation = function handleErrorValidation(error, status = 403) {
  return this.status(status).json({ validation: error });
};

express.response.notFound = function handleErrorNotFound() {
  return this.status(404).json({ error: 'Recurso no encontrado' });
};

express.response.handleReject = function handleReject(err) {
  if (err instanceof ErrorLogic) {
    switch (err.message) {
      case 'NOT_FOUND':
        return this.notFound();
        // break;
      default:
        return this.error(err.message);
        // break;
    }
  }

  console.log('=ERROR====', err); // eslint-disable-line

  return this.error('Ocurrió un error', 500);
};
