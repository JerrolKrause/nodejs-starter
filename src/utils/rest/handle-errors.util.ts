import { Response } from 'express';
import { Error } from 'mongoose';

/**
 * Handle REST api errors
 * @param err
 * @param res
 */
export const handleError = (err: Error, res: Response) => {
  console.error('API Error', err); // Log the detailed error for debugging
  res.status(400).json({ message: err.message });
};
