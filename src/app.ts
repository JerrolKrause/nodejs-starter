import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import express from 'express';

import { todoRoutes } from './routes/api/v1/todos/todos.route';
import { addEnvFile } from './utils';

// Load the .env file specified by the ENV_PATH environment variable
const envPath = process.env['ENV_PATH'] || 'src/env/.env.development'; // Fallback to default .env
// Load ENV variables into node ENV
dotenv.config({ path: envPath });

const isProduction = process.env['NODE_ENV'] === 'prod';
const dbConnectionString = process.env['DB_CONNECTION_STRING'];
if (!dbConnectionString) {
  console.error('DB connection string not found');
}

// If not on prod...
// Add source map support
if (!isProduction) {
  require('source-map-support').install();
  process.on('unhandledRejection', console.log);
}

// Initialize express server
const app = express();

// Check for the existence of a secure env file, create one if not
addEnvFile();

// Parse body responses as JSON
app.use(bodyParser.json());

// Routes
const apiSlug = '/api/v1'; // Base API url slug
app.use(apiSlug, todoRoutes);

app.listen(3000);
