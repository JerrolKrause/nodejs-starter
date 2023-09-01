import { NextFunction, Request, Response, Router } from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
export const routes = Router();

/**
 * Initialize multer storage
 */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, './uploads/');
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

/**
 * Initialize multer with the storage engine
 */
export const upload = multer({
  storage: storage,
  dest: 'uploads/',
  fileFilter: (_req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      return cb(null, false);
    }
  },
});

/**
 * File upload route
 * @route POST /upload
 * @param {File} req.files.file - The uploaded file
 */
routes.post('/upload', upload.single('file'), (req: Request, res: Response, next: NextFunction) => {
  // Log uploaded file details
  console.log(`Uploaded file details: `, req.file);
  if (!req.file) {
    return next(new Error('Unable to upload file'));
  }
  // Send a response to the client
  res.status(200).json({ message: 'File uploaded successfully' });
});

// Global error handler should be defined last, after all routes
routes.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(400).json({ message: `Upload Error: ${error.message}` });
});

/**
 * Ensure uploads directory exists, if not create it
 */
const uploadDir = './uploads';
if (!pathExistsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

/**
 * Check if the path exists
 * @param path The path to check
 * @returns {boolean} True if the path exists, false otherwise
 */
function pathExistsSync(path: string): boolean {
  try {
    fs.accessSync(path);
    return true;
  } catch {
    return false;
  }
}

export const uploadRoute = routes;
