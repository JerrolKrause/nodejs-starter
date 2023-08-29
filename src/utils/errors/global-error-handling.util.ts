import { ErrorRequestHandler } from 'express';
import { writeErrorToLog } from './write-error-to-file.util';

/**
 * Global error handler middleware for Express.
 *
 * @param {Error} err - The error object.
 * @param {Request} _req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} _next - The next middleware in the chain.
 */
export const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Log the error to the console
  // console.error('Global error:', JSON.stringify(err));

  // Write the error details to a log file
  writeErrorToLog(err);

  // Determine the status code based on error type
  const statusCode = err.status ?? 500;

  // Respond with a more specific error message
  res.status(statusCode).json({
    message: err.message || 'An unexpected error occurred',
  });
};
