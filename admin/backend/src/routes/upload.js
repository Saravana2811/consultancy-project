import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const materialsUploadDir = path.join(__dirname, '../../uploads/materials');

function authenticateToken(req, res, next) {
  const token = (req.headers['authorization'] || '').split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = decoded;
    next();
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(materialsUploadDir)) {
      fs.mkdirSync(materialsUploadDir, { recursive: true });
    }
    cb(null, materialsUploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, path.basename(file.originalname, path.extname(file.originalname)) + '-' + unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const ok = /jpeg|jpg|png|gif|webp/.test(path.extname(file.originalname).toLowerCase());
  cb(ok ? null : new Error('Only image files allowed'), ok);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/image', authenticateToken, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const PORT = process.env.PORT || 5001;
  const imageUrl = `http://localhost:${PORT}/uploads/materials/${req.file.filename}`;
  console.log('✅ Image uploaded:', imageUrl);
  res.json({ message: 'Image uploaded successfully', imageUrl, filename: req.file.filename });
});

router.use((error, req, res, next) => {
  if (error) return res.status(400).json({ error: error.message });
  next();
});

export default router;
