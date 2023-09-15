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
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 */
export const isAuth = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.get('Authorization')?.split(' ')[1];

  // Make sure that token and token secrete are present
  if (!token || !environment.tokenSecret) {
    res.status(500).json({ errors: 'Internal server error. Configuration is missing.' });
    return;
  }

  // Decode token
  let decodedToken: JwtPayload | string;
  try {
    decodedToken = verify(token, environment.tokenSecret);
  } catch (err) {
    res.status(401).json({ errors: 'Unauthorized. Invalid token.' });
    return;
  }

  // If not decoded for some reason
  if (!decodedToken) {
    res.status(401).json({ errors: 'Unauthorized. Invalid token.' });
    return;
  }

  // Token should not be a string
  if (typeof decodedToken === 'string') {
    res.status(500).json({ errors: 'Internal server error. Token validation failed.' });
    return;
  }

  // Set userID to request
  req.userId = decodedToken['id'];

  next();
};
