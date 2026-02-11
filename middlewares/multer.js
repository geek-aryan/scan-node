const multer = require('multer');
const path = require('path');
const fs = require('fs');

/* -----------------------------------------------------
   DEFAULT CONFIG (used if route doesn't override)
----------------------------------------------------- */
const DEFAULTS = {
  uploadDir: path.join(__dirname, '../uploads'),
  limits: {
    fileSize: 70 * 1024 * 1024,   // 70 MB
    fieldSize: 10 * 1024 * 1024   // 10 MB
  },
  allowedExtensions: null, // null = allow all
  allowedMimeTypes: null   // null = allow all
};

/* -----------------------------------------------------
   Ensure upload directory exists
----------------------------------------------------- */
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/* -----------------------------------------------------
   Multer Factory
----------------------------------------------------- */
/**
 * @param {Object} options
 * @param {Object} options.fieldRules
 *   Example:
 *   {
 *     avatar: {
 *       extensions: ['.jpg', '.png'],
 *       mimeTypes: ['image/jpeg', 'image/png'],
 *       maxSize: 2 * 1024 * 1024
 *     },
 *     resume: {
 *       extensions: ['.pdf'],
 *       mimeTypes: ['application/pdf']
 *     }
 *   }
 *
 * @param {Object} options.limits
 * @param {String} options.uploadDir
 */

const createUploader = (options = {}) => {
  const {
    fieldRules = {},
    limits = {},
    uploadDir = DEFAULTS.uploadDir
  } = options;

  ensureDir(uploadDir);

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      cb(null, `${file.fieldname}-${unique}${ext}`);
    }
  });

  const fileFilter = (req, file, cb) => {
    const rule = fieldRules[file.fieldname];

    // ❌ Field not allowed at all
    if (!rule) {
      const err = new Error(`Field "${file.fieldname}" is not allowed`);
      err.code = 'INVALID_FIELD';
      return cb(err, false);
    }

    const ext = path.extname(file.originalname).toLowerCase();

    // ❌ Extension check
    if (rule.extensions && !rule.extensions.includes(ext)) {
      const err = new Error(
        `Invalid extension for ${file.fieldname}. Allowed: ${rule.extensions.join(', ')}`
      );
      err.code = 'INVALID_EXTENSION';
      return cb(err, false);
    }

    // ❌ Mime type check
    if (rule.mimeTypes && !rule.mimeTypes.includes(file.mimetype)) {
      const err = new Error(
        `Invalid mime type for ${file.fieldname}. Allowed: ${rule.mimeTypes.join(', ')}`
      );
      err.code = 'INVALID_MIMETYPE';
      return cb(err, false);
    }

    cb(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      ...DEFAULTS.limits,
      ...limits
    }
  });
};

module.exports = createUploader;
