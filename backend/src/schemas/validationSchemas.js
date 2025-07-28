const Joi = require('joi');

// User registration validation
const registerSchema = Joi.object({
  email: Joi.string().email().max(255).required().messages({
    'string.email': 'Please provide a valid email address',
    'string.max': 'Email must not exceed 255 characters',
    'any.required': 'Email is required',
  }),

  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(
      new RegExp(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'
      )
    )
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password must not exceed 128 characters',
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required',
    }),

  firstName: Joi.string()
    .min(2)
    .max(100)
    .pattern(new RegExp('^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\\s]+$'))
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name must not exceed 100 characters',
      'string.pattern.base': 'First name can only contain letters and spaces',
      'any.required': 'First name is required',
    }),

  lastName: Joi.string()
    .min(2)
    .max(100)
    .pattern(new RegExp('^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\\s]+$'))
    .required()
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name must not exceed 100 characters',
      'string.pattern.base': 'Last name can only contain letters and spaces',
      'any.required': 'Last name is required',
    }),
});

// User login validation
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),

  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

// User update validation
const updateUserSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(100)
    .pattern(new RegExp('^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\\s]+$'))
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name must not exceed 100 characters',
      'string.pattern.base': 'First name can only contain letters and spaces',
    }),

  lastName: Joi.string()
    .min(2)
    .max(100)
    .pattern(new RegExp('^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\\s]+$'))
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name must not exceed 100 characters',
      'string.pattern.base': 'Last name can only contain letters and spaces',
    }),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });

// Change password validation
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required',
  }),

  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(
      new RegExp(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'
      )
    )
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters long',
      'string.max': 'New password must not exceed 128 characters',
      'string.pattern.base':
        'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'New password is required',
    }),
});

// Pagination validation
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1',
  }),

  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit must not exceed 100',
  }),
});

// File ID validation
const fileIdSchema = Joi.object({
  id: Joi.number().integer().min(1).required().messages({
    'number.base': 'File ID must be a number',
    'number.integer': 'File ID must be an integer',
    'number.min': 'File ID must be at least 1',
    'any.required': 'File ID is required',
  }),
});

// Transcription ID validation
const transcriptionIdSchema = Joi.object({
  id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Transcription ID must be a number',
    'number.integer': 'Transcription ID must be an integer',
    'number.min': 'Transcription ID must be at least 1',
    'any.required': 'Transcription ID is required',
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateUserSchema,
  changePasswordSchema,
  paginationSchema,
  fileIdSchema,
  transcriptionIdSchema,
};
