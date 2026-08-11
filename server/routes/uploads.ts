import { Router } from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/gif", "image/webp", "application/pdf"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new Error("unsupported_file_type"));
    }
    cb(null, true);
  },
});

const router = Router();

router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "no_file" });
  res.status(201).json({ path: req.file.filename, name: req.file.originalname });
});

export default router;
