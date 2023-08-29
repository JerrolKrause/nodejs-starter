import { Router } from 'express';

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

export const sessionRoute = routes;
