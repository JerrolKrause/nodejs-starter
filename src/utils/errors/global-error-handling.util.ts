import { ErrorRequestHandler } from 'express';

// Define a global error handler
export const globalErrorHandler: ErrorRequestHandler = (err, _req, res) => {
  // Log the error details (for internal use)
  console.error('Global error:', err);

  // Respond with a generic error message (for end users)
  res.status(500).json({ message: 'An unexpected error occurred. Please try again later.', err });
};
