import dotenv from 'dotenv';
import express from 'express';
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

// Parse body responses as JSON
app.use(express.json());

// Dynamically generated REST routes
restRoutes.forEach(r => app.use('/api/v1', r));

// Static routes

// Use the global error handler as the last middleware
app.use(globalErrorHandler);

// Function to connect to the database
const connectToDatabase = () => {
  mongoose
    .connect(env.dbConnectionString ?? '', {
      useNewUrlParser: true,
      // useUnifiedTopology: true,
      autoReconnect: true, // Automatically try reconnecting if the connection is lost
      reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
      reconnectInterval: 500, // Reconnect every 500ms
    })
    // .then(() =>  console.log('Connected to MongoDB.'))
    .catch(err => console.error('Failed to connect to MongoDB.', err));
};

// Function to handle when the connection is disconnected
const handleDisconnection = (message: unknown) => {
  console.error('MongoDB connection disconnected.', message);
  // Attempt to reconnect after a delay
  setTimeout(connectToDatabase, 3000);
};

// Handle events for the Mongoose connection
mongoose.connection.on('connected', () => console.log('MongoDB connected.'));
mongoose.connection.on('error', err => console.error('MongoDB connection error:', err));
mongoose.connection.on('disconnected', handleDisconnection);

// Initial connection attempt
connectToDatabase();
