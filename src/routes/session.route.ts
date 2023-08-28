import { Router } from 'express';

const routes = Router();
/** GET All */
routes.get('/session', (_req, res) => {
  throw new Error('This is an error');
  return res.json(['Hello World']);
});

export const sessionRoute = routes;
