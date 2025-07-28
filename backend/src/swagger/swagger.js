const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vocali API',
      version: '1.0.0',
      description: 'API for Vocali audio transcription platform',
      contact: {
        name: 'Vocali Team',
        email: 'support@vocali.com',
      },
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            firstName: {
              type: 'string',
              description: 'User first name',
            },
            lastName: {
              type: 'string',
              description: 'User last name',
            },
            isActive: {
              type: 'boolean',
              description: 'Whether the user account is active',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        AudioFile: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'File ID',
            },
            userId: {
              type: 'integer',
              description: 'Owner user ID',
            },
            originalFilename: {
              type: 'string',
              description: 'Original filename',
            },
            storedFilename: {
              type: 'string',
              description: 'Stored filename',
            },
            fileSize: {
              type: 'integer',
              description: 'File size in bytes',
            },
            mimeType: {
              type: 'string',
              description: 'File MIME type',
            },
            s3Key: {
              type: 'string',
              description: 'S3 object key',
            },
            s3Url: {
              type: 'string',
              description: 'S3 public URL',
            },
            uploadStatus: {
              type: 'string',
              enum: ['uploading', 'completed', 'failed'],
              description: 'Upload status',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Upload timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        Transcription: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Transcription ID',
            },
            audioFileId: {
              type: 'integer',
              description: 'Associated audio file ID',
            },
            userId: {
              type: 'integer',
              description: 'Owner user ID',
            },
            transcriptionText: {
              type: 'string',
              description: 'Transcribed text',
            },
            confidenceScore: {
              type: 'number',
              format: 'float',
              description: 'Confidence score (0-1)',
            },
            language: {
              type: 'string',
              description: 'Detected/specified language',
            },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'completed', 'failed'],
              description: 'Transcription status',
            },
            processingStartedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Processing start timestamp',
            },
            processingCompletedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Processing completion timestamp',
            },
            errorMessage: {
              type: 'string',
              description: 'Error message if failed',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error type',
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                  },
                  message: {
                    type: 'string',
                  },
                },
              },
              description: 'Validation error details',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Error timestamp',
            },
            path: {
              type: 'string',
              description: 'Request path',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/controllers/*.js', './src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

const swaggerSetup = (app) => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Vocali API Documentation',
    })
  );

  // Serve the swagger.json file
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};

module.exports = swaggerSetup;
