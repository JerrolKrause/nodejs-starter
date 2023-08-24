import bodyParser from 'body-parser';
import express from 'express';

import { todoRoutes } from './routes';
import { addEnvFile } from './utils';

const app = express();

// Check for the existence of a secure env file, create one if not
addEnvFile();

// Test 1234123
app.use(bodyParser.json());
app.use('/api/v1', todoRoutes);

app.listen(3000);
