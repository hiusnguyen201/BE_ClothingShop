import express from 'express';
const router = express.Router();

import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Clothing Shop',
      description: 'Clothing Store API Documentation',
      version: '2.0.0',
    },
    servers: [
      {
        url: 'https://server-clothes-store.vercel.app/api/v2',
        description: 'Production Server',
      },
      {
        url: 'http://localhost:3000/api/v2',
        description: 'Development Server',
      },
    ],
  },
  apis: ['./src/routes/v2/**/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default router;
