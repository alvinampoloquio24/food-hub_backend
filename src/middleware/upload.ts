import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { v4 as uuidv4 } from "uuid";
import path from "path";

// Define the storage engine to store the uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + uuidv4();
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

// Define the file filter to accept only specific file types
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const filetypes = /jpeg|jpg|png|img|svg/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("File type not supported"));
  }
};

// Set the maximum file size allowed to upload
const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB
};

// Initialize multer with the defined settings
const upload = multer({
  storage,
  fileFilter,
  limits,
});

export default upload;
