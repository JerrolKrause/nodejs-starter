import { Router } from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
export const routes = Router();

/** Base upload directory for files */
const baseUploadDir = './uploads';

/**
 * Ensure uploads directory exists, if not create it
 */
if (!pathExistsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir);
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

/**
 * Interface defining the configurable options for the File Upload controller.
 */
export interface FileUploadControllerOptions {
  /** The sub directory where the uploaded files should be stored. Base directory is ./uploads/ so a value of '/images' will upload to /uploads/images/ @example /images */
  destinationDirectory?: string;
  /** The maximum file size allowed for upload, in bytes. @default 5 * 1024 * 1024 (5 MB)*/
  maxFileSize?: number;
  /** Regular expression pattern to check if the uploaded file type is whitelisted. @default /jpeg|jpg|png|gif|pdf/ */
  whitelistedFileTypes?: RegExp;
  /** Function to generate the name for the uploaded file. @default `${Date.now()}-${file.originalname}` */
  fileName?: (file: Express.Multer.File) => string;
}

/**
 * Generates a controller to handle file uploads. Uses Multer.
 *
 * @param {FileUploadControllerOptions | null} options - An object containing optional configurations for file uploads.
 * @returns {multer.Multer} - Multer middleware configured based on the options provided.
 */
export const fileUploadController = (options?: FileUploadControllerOptions | null) =>
  multer({
    /**
     * Multer storage
     */
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, baseUploadDir + (options?.destinationDirectory ?? '')),
      filename: (_req, file, cb) => cb(null, options?.fileName ? options?.fileName(file) : `${Date.now()}-${file.originalname}`),
    }),
    limits: {
      fileSize: options?.maxFileSize ?? 5 * 1024 * 1024, // Default max 5 MB filesize
    },
    fileFilter: (_req, file, cb) => {
      if (!options?.whitelistedFileTypes) {
        return cb(null, true);
      }
      const filetypes = options.whitelistedFileTypes ?? /jpeg|jpg|png|gif|pdf/; // Default supported filetypes
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = filetypes.test(file.mimetype);

      if (extname && mimetype) {
        return cb(null, true);
      } else {
        return cb(new Error('That filetype is not supported') as any, false); // Improperly typed, requires any
      }
    },
  });
