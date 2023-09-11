
import { Router, Request, Response, NextFunction } from "express";
import fileUploadController from "../controllers/file-upload.controller.optimized";

/** Initialize router */
const router = Router();

/**
 * File upload route
 * @route POST /upload
 */
router.post("/upload", fileUploadController);

export default router;
