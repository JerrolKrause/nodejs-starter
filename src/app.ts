import bodyParser from 'body-parser';
import express from 'express';
import { todoRoutes } from './routes';

const app = express();

// Test 1234123
app.use(bodyParser.json());
app.use(todoRoutes);

app.listen(3000);
