
import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";

/** Configure Multer for file uploads */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

/** Initialize router */
const router = Router();

/**
 * Handles file upload.
 * @route POST /upload
 */
router.post("/upload", upload.single("file"), (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({ message: "File uploaded successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
