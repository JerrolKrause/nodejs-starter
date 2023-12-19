import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoose from 'mongoose';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import 'tsconfig-paths/register';

import { isAuth } from '$middleware';
import { Env } from '$models';
import { globalErrorHandler, initializeFiles, writeErrorToLog } from '$utils';
import { restRoutes, sessionRoute, uploadRoute, userRoute } from './routes';

// Check for the existence of startup files, create if not found
initializeFiles();

// Load the .env file specified by the ENV_PATH environment variable. ENV_PATH is set via the npm run command
const envPath = process.env['ENV_PATH'] || 'src/env/.env.development'; // Fallback to default .env
// Load ENV variables into node ENV
dotenv.config({ path: envPath });

// Extract typesafe environment variables from node process
export const environment: Env = {
  path: process.env['ENV_PATH'] || 'src/env/.env.development',
  env: (process.env['NODE_ENV'] as 'dev' | 'production') || 'dev',
  dbConnectionString: process.env['DB_CONNECTION_STRING'] ?? null,
  tokenSecret: process.env['TOKEN_SECRET'] ?? null,
};

// Is on prod env
const isProd = environment.env === 'production';

if (!environment.dbConnectionString || environment.dbConnectionString === 'your-connection-string') {
  console.error('DB connection string not found');
}

// If not on prod...
// Add source map support
if (!isProd) {
  require('source-map-support').install();
  process.on('unhandledRejection', console.log);
}

// Initialize express server
const app = express();

// Apply rate limiter to all requests
app.use(
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, please try again later.',
  }),
);

// CORS Handling. Allow requests from other domains
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow access from this domain. Change wildcard to improve security
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE'); // Allow these methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow these additional headers
  next();
});

// Content Security Policy setup. Has to be before any routes
app.use(helmet());

// Handle requests  for static files
// Public will be static file root so a file at public\json\test.json will serve from http://localhost:3000/json/test.json
app.use(express.static('public'));

// Parse body responses as JSON
app.use(express.json());

// Base path for API. Versioned for future proofing
const apiSlug = '/api/v1';

app.use(apiSlug, sessionRoute); // Session. Must be first

// Dynamically generated REST routes
restRoutes.forEach(r => app.use(apiSlug, isAuth, r));

// Static routes
app.use(apiSlug, isAuth, userRoute); // User management
app.use(apiSlug, isAuth, uploadRoute); // File Uploads

// Dev only routes
if (!isProd) {
  // Initialize swagger-jsdoc -> returns validated swagger spec in json format
  const swaggerSpec = swaggerJsdoc({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'NodeJS Starter Application',
        version: '1.0.0',
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

// Handle events for the Mongoose connection
mongoose.connection.on('connected', () => console.log('Application started successfully'));
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
  writeErrorToLog(err);
});
mongoose.connection.on('disconnected', () => console.error('MongoDB disconnected'));

// Connect to DB and start server
mongoose
  .connect(environment.dbConnectionString ?? '', {
    useNewUrlParser: true,
    useUnifiedTopology: true, // Automaically trys to reconnect
  })
  .then(() => app.listen(3000))
  .catch(err => {
    console.error('Failed to connect to MongoDB.', err);
    writeErrorToLog(err);
  });
