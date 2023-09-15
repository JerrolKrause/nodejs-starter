import { NextFunction, Request, Response } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';
import { environment } from '../app';

// Extend Express Request to include userId as an optional property
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
/**
 * Middleware to check if the user is authenticated.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 */
export const isAuth = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.get('Authorization')?.split(' ')[1];
  let decodedToken: JwtPayload | string;
  if (!token || !environment.tokenSecret) {
    throw res.status(500).json({ errors: 'Missing important stuff' });
  }
  try {
    decodedToken = verify(token, environment.tokenSecret);
  } catch (err) {
    throw res.status(500).json({ errors: err });
  }
  if (!decodedToken) {
    throw res.status(401).json({ errors: 'Not authenticated' });
  }
  if (typeof decodedToken === 'string') {
    throw res.status(500).json({ errors: 'Token problems' });
  }
  req.userId = decodedToken['userId'];

  next();
};
