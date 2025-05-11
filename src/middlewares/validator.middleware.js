import Joi from 'joi';
import AppError from '../utils/appError.utils.js';

// Utility: pick specific keys from an object
function pick(obj, keys) {
  return keys.reduce((acc, key) => {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}

// Validation middleware (no file support)
export function validate(schema) {
  return (req, res, next) => {
    const validSchema = pick(schema, ['params', 'query', 'body']);
    const dataToValidate = pick(req, Object.keys(validSchema));

    const { value, error } = Joi.compile(validSchema)
      .prefs({ abortEarly: false, errors: { label: 'key' } })
      .validate(dataToValidate);

    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      throw new AppError(message, 400);
    }

    Object.assign(req, value);
    return next();
  };
}
