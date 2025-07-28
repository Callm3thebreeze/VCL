const Joi = require('joi');

const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      validationError.status = 400;
      validationError.details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      return next(validationError);
    }

    // Replace the original data with validated data
    req[property] = value;
    next();
  };
};

module.exports = {
  validateRequest,
};
