import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import 'tsconfig-paths/register';

import { globalErrorHandler, initializeFiles } from '$utils';

import { environment } from './env/environment';
import { restRoutes } from './routes';

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

// Content Security Policy setup. Has to be before any routes!
app.use(helmet());

// Parse body responses as JSON
app.use(express.json());

// Dynamically generated REST routes
restRoutes.forEach(r => app.use('/api/v1', r));

// Static routes

// 404 handler for non matched routes, must be after all other middlewhere but before error
app.use((_req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Use the global error handler as the last middleware
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
mongoose.connection.on('connected', () => console.log('MongoDB connected.'));
mongoose.connection.on('error', err => console.error('MongoDB connection error:', err));
mongoose.connection.on('disconnected', err => console.error('MongoDB disconnected:', err));

// Initial connection attempt
connectToDatabase();
