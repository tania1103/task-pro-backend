// middleware/upload.js
const multer = require('multer');
const path = require('path');

// Storage: temporar pe disc
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Asigură-te că această directoare există!
  },
  filename: function (req, file, cb) {
    // Exemplu: userId_timestamp.extensie
    const ext = path.extname(file.originalname);
    cb(null, req.user ? req.user.id + '_' + Date.now() + ext : Date.now() + ext);
  }
});

// Opțional: acceptă doar imagini
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
