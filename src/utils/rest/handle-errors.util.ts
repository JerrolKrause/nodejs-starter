import { Response } from 'express';
import { Error } from 'mongoose';

/**
 * Handle REST api errors
 * @param err
 * @param res
 */
export const handleError = (err: Error, res: Response) => {
  console.error(err); // Log the detailed error for debugging
  res.status(500).json({ message: `An error occurred: ${err.message}` });
};
