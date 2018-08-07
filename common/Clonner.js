const clone = (obj) => {
  if (obj === null || typeof obj !== 'object') { return obj; }
  const temp = obj.constructor();
  for (const key in obj) { // eslint-disable-line
    // temp[ key ] = clone( obj[ key ] );
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      temp[key] = clone(obj[key]);
    } else if ({}.hasOwnProperty.call(obj, key)) {
      temp[key] = clone(obj[key]);
    }
  }
  return temp;
};

module.exports = clone;
