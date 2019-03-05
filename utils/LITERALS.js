const LITERALS = require('./literalsCode');
const englishLiterals = require('./englishLiterals');
const spanishLiterals = require('./spanishLiterals');

const getSpanishMessages = (LITERAL) => {
  const message = spanishLiterals[LITERAL];

  if (!message) { return 'Ocurrió un error'; }

  return message;
};

const getEnglishMessages = (LITERAL) => {
  const message = englishLiterals[LITERAL];

  if (!message) { return 'An error occurred'; }

  return message;
};


/**
 * Get readable message by literal code
 * @param {String} LITERAL LITERAL CODE -Example: PASSWORD_INVALID
 * @param {String} lenguage 'es' for spanish and 'en' for english
 * @returns {String} message
 */
const getMessage = (LITERAL, lenguage) => {
  switch (lenguage) {
    case 'es':
      return getSpanishMessages(LITERAL);
    case 'en':
      return getEnglishMessages(LITERAL);
    default:
      return getEnglishMessages(LITERAL);
  }
};

module.exports = {
  getMessage,
  ...LITERALS,
};
