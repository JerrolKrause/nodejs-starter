import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoose from 'mongoose';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import 'tsconfig-paths/register';

import { globalErrorHandler, initializeFiles } from '$utils';

import { environment } from './env/environment';
import { restRoutes, sessionRoute } from './routes';

// Check for the existence of startup files, create if not found
initializeFiles();

// Load the .env file specified by the ENV_PATH environment variable
const envPath = process.env['ENV_PATH'] || 'src/env/.env.development'; // Fallback to default .env
// Load ENV variables into node ENV
dotenv.config({ path: envPath });

// Extract typesafe environment variables from node process
const env = environment(process.env);

if (!env.dbConnectionString) {
  console.error('DB connection string not found');
}

// If not on prod...
// Add source map support
if (env.env === 'dev') {
  require('source-map-support').install();
  process.on('unhandledRejection', console.log);
}

// Initialize express server
const app = express();

// Apply rate limiter to all requests
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, please try again later.',
  }),
);

// Content Security Policy setup. Has to be before any routes!
app.use(helmet());

// Handle static request for files
app.use(express.static('public'));

// Parse body responses as JSON
app.use(express.json());

// Dynamically generated REST routes
restRoutes.forEach(r => app.use('/api/v1', r));

// Static routes
app.use('/api/v1', sessionRoute); // Session

// Dev only routes
if (env.env === 'dev') {
  // Initialize swagger-jsdoc -> returns validated swagger spec in json format
  const swaggerSpec = swaggerJsdoc({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'NodeJS Starter Application',
        version: '0.0.1',
      },
    },
    apis: ['./**/*.ts'], // files containing annotations as above
  });
  // Swagger for API documentation
  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// 404 handler for non matched routes, must be after all other middlewhere but before error
app.use((_req, res) => res.status(404).json({ message: 'Resource not found' }));

// Use the global error handler. Must be last
app.use(globalErrorHandler);

// Function to connect to the database
const connectToDatabase = () => {
  mongoose
    .connect(env.dbConnectionString ?? '', {
      useNewUrlParser: true,
      useUnifiedTopology: true, // Automaically trys to reconnect
    })
    .then(() => app.listen(3000))
    .catch(err => console.error('Failed to connect to MongoDB.', err));
};

// Handle events for the Mongoose connection
mongoose.connection.on('connected', () => console.log('MongoDB connected'));
mongoose.connection.on('error', err => console.error('MongoDB connection error:', err));
mongoose.connection.on('disconnected', () => console.error('MongoDB disconnected'));

// Initial connection attempt
connectToDatabase();
