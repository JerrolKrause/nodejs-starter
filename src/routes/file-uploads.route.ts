import { fileUploadController } from '$controllers';
import { NextFunction, Request, Response, Router } from 'express';
export const routes = Router();

/**
 * File upload route
 * @route POST /upload
 * @param {File} req.files.file - The uploaded file
 */
routes.post('/upload', fileUploadController().single('file'), (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new Error('Unable to upload file'));
  }
  // Log uploaded file details
  console.log(`Uploaded file details: `, req.file);
  // Do something with uploaded file here, IE store info in DB etc:

  // Send a response to the client
  return res.status(200).send();
});

// Global error handler should be defined last, after all routes
routes.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(400).json({ message: `${error.message}` });
});

export const uploadRoute = routes;
