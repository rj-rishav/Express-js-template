import Joi from 'joi';

const AuthValidation = {
  signup: {
    body: {
      name: Joi.string().min(2).max(50).trim().required().messages({
        'string.base': 'Name must be a string',
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name must be at most 50 characters long',
        'any.required': 'Name is required',
      }),

      email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
          'string.base': 'Email must be a string',
          'string.empty': 'Email is required',
          'string.email': 'Email must be a valid email address',
          'any.required': 'Email is required',
        }),

      password: Joi.string()
        .min(8)
        .max(128)
        .pattern(new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}'))
        .required()
        .messages({
          'string.base': 'Password must be a string',
          'string.empty': 'Password is required',
          'string.min': 'Password must be at least 8 characters long',
          'string.max': 'Password must be less than 128 characters',
          'string.pattern.base':
            'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character',
          'any.required': 'Password is required',
        }),
    },
  },

  signin: {
    body: {
      email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
          'string.base': 'Email must be a string',
          'string.empty': 'Email is required',
          'string.email': 'Email must be a valid email address',
          'any.required': 'Email is required',
        }),

      password: Joi.string().required().messages({
        'string.base': 'Password must be a string',
        'string.empty': 'Password is required',
        'any.required': 'Password is required',
      }),
    },
  },
};

export default AuthValidation;
