const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');

// Resume storage
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(uploadDir, 'resumes'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `resume-${uuidv4()}${ext}`);
  },
});

// Avatar storage
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(uploadDir, 'avatars'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uuidv4()}${ext}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedMimes = {
    resume: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    avatar: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  };

  const type = req.uploadType || 'resume';
  const allowed = allowedMimes[type] || allowedMimes.resume;

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowed.join(', ')}`), false);
  }
};

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB

const uploadResume = multer({
  storage: resumeStorage,
  fileFilter: (req, file, cb) => {
    req.uploadType = 'resume';
    fileFilter(req, file, cb);
  },
  limits: { fileSize: MAX_FILE_SIZE },
}).single('resume');

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: (req, file, cb) => {
    req.uploadType = 'avatar';
    fileFilter(req, file, cb);
  },
  limits: { fileSize: MAX_FILE_SIZE },
}).single('avatar');

// Generic upload error handler
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

module.exports = { uploadResume, uploadAvatar, handleUploadError };
