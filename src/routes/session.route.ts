import { Router } from 'express';
import { body, validationResult } from 'express-validator';

export interface Session {
  username: string;
  password: string;
}

const routes = Router();
/**
 * @swagger
 * /session:
 *  get:
 *    description: Returns an array with the message 'Hello World'
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            example: ["Hello World"]
 */
routes.get('/session', (_req, res) => {
  return res.json(['Hello World']);
});

routes.post('/session', body('username').trim().escape().isLength({ min: 5 }), body('password').trim().escape().isLength({ min: 5 }), (req, res) => {
  const errors = validationResult(req);

  // Has errors
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: 'Validation failed', errors });
  }

  return res.json(['Hello World']);
});

export const sessionRoute = routes;
