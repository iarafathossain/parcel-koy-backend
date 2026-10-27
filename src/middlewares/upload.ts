import { randomUUID } from "crypto";
import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import multerS3 from "multer-s3";
import path from "path";
import { BUCKET, s3 } from "../config/s3";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const createFileFilter =
  (allowedTypes: string[]) =>
  (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Unsupported file type"));
  };

const storage = multerS3({
  s3,
  bucket: BUCKET,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: (_req, file, cb) => cb(null, { originalName: file.originalname }),
  key: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `uploads/${randomUUID()}${ext}`);
  },
});

export const upload = multer({
  storage,
  fileFilter: createFileFilter(ALLOWED_TYPES),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // 5 MB each, max 5 files
});

export const imageUpload = multer({
  storage,
  fileFilter: createFileFilter(ALLOWED_IMAGE_TYPES),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});
