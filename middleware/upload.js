import multer from "multer";
import path from "path";

// Storage konfigurasi
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder untuk menyimpan gambar
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

// Filter file hanya image
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) return cb(null, true);
  cb(new Error("File type not allowed"));
};

const upload = multer({ storage, fileFilter });

export default upload;
