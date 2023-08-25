import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import 'tsconfig-paths/register';

import { initializeFiles } from '$utils';
import { environment } from './env/environment';
import { restRoutes } from './routes/api/v1/api-endpoints';

// Check for the existence of startup files
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

// Parse body responses as JSON
app.use(bodyParser.json());

// Dynamically generated REST routes
restRoutes.forEach(r => app.use('/api/v1', r));

// Static routes

mongoose
  .connect(env.dbConnectionString ?? '', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(3000);
  })
  .catch(err => console.log(err));
