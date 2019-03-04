const LITERALS = require('./literalsCode');
const englishLiterals = require('./englishLiterals');
const spanishLiterals = require('./spanishLiterals');

const getSpanishMessages = (LITERAL) => {
  const message = spanishLiterals[LITERAL];

  if (!message) { return 'Ocurrió un error'; }

  return message;
};

const getEnglishMesages = (LITERAL) => {
  const message = englishLiterals[LITERAL];

  if (!message) { return 'An error occurred'; }

  return message;
};

const getMessage = (LITERAL, lenguage) => {
  switch (lenguage) {
    case 'es':
      return getSpanishMessages(LITERAL);
    case 'en':
      return getEnglishMesages(LITERAL);
    default:
      return getEnglishMesages(LITERAL);
  }
};

module.exports = {
  getMessage,
  ...LITERALS,
};
