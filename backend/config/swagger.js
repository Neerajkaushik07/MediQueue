import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MediQueue API Documentation',
      version: '1.0.0',
      description: 'Comprehensive API documentation for the MediQueue healthcare appointment booking system',
      contact: {
        name: 'API Support',
        email: 'support@mediqueue.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server',
      },
      {
        url: 'https://api.mediqueue.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID',
            },
            name: {
              type: 'string',
              description: 'User full name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            phone: {
              type: 'string',
              description: 'User phone number',
            },
            address: {
              type: 'object',
              properties: {
                line1: { type: 'string' },
                line2: { type: 'string' },
              },
            },
            gender: {
              type: 'string',
              enum: ['Male', 'Female', 'Other', 'Not Selected'],
            },
            dob: {
              type: 'string',
              description: 'Date of birth',
            },
            image: {
              type: 'string',
              description: 'Profile image URL',
            },
          },
        },
        Doctor: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Doctor ID',
            },
            name: {
              type: 'string',
              description: 'Doctor full name',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            speciality: {
              type: 'string',
            },
            degree: {
              type: 'string',
            },
            experience: {
              type: 'string',
            },
            about: {
              type: 'string',
            },
            fees: {
              type: 'number',
            },
            address: {
              type: 'object',
            },
            available: {
              type: 'boolean',
            },
          },
        },
        Appointment: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
            },
            userId: {
              type: 'string',
            },
            docId: {
              type: 'string',
            },
            slotDate: {
              type: 'string',
            },
            slotTime: {
              type: 'string',
            },
            amount: {
              type: 'number',
            },
            date: {
              type: 'string',
              format: 'date-time',
            },
            cancelled: {
              type: 'boolean',
            },
            payment: {
              type: 'boolean',
            },
            isCompleted: {
              type: 'boolean',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
            },
            data: {
              type: 'object',
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'User',
        description: 'User management and authentication',
      },
      {
        name: 'Doctor',
        description: 'Doctor operations',
      },

      {
        name: 'Appointment',
        description: 'Appointment management',
      },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * Setup Swagger UI
 * @param {Express} app - Express application
 */
export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'MediQueue API Docs',
  }));

  // Serve swagger spec as JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

export default swaggerSpec;
