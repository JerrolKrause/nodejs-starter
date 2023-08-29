import { Response } from 'express';
import { Error } from 'mongoose';
import { writeErrorToLog } from './write-error-to-file.util';

/**
 * Handle REST api errors
 * @param err
 * @param res
 */
export const handleDBError = (err: Error, res: Response) => {
  console.error('Database Error:', JSON.stringify(err)); // Log the detailed error for debugging
  // Write the error details to a log file
  writeErrorToLog(err);
  res.status(400).json({ message: err.message });
};
