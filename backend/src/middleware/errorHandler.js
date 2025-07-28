const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error response
  let error = {
    message: err.message || 'Internal server error',
    status: err.status || 500,
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.status = 400;
    error.message = 'Validation error';
    error.details = err.details;
  }

  if (err.code === 'ER_DUP_ENTRY') {
    error.status = 409;
    error.message = 'Duplicate entry - resource already exists';
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    error.status = 400;
    error.message = 'Referenced resource does not exist';
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    error.status = 413;
    error.message = 'File size exceeds maximum allowed size';
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error.status = 400;
    error.message = 'Unexpected file field or too many files';
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    delete error.stack;
    if (error.status === 500) {
      error.message = 'Internal server error';
    }
  } else {
    error.stack = err.stack;
  }

  res.status(error.status).json({
    error: error.message,
    ...(error.details && { details: error.details }),
    ...(error.stack && { stack: error.stack }),
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};

module.exports = errorHandler;
