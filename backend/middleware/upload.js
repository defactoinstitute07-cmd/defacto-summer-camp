const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");

// Use memory storage — files are kept in RAM as Buffer, then streamed to Cloudinary
const memoryStorage = multer.memoryStorage();

/**
 * Base multer instance — limits to 5 MB, images only.
 */
const baseUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."), false);
    }
  },
});

/**
 * Streams a file Buffer to Cloudinary and returns the upload result.
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {object} options - Cloudinary upload options (folder, public_id, etc.)
 * @returns {Promise<object>} Cloudinary upload result
 */
const streamToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Express middleware factory that:
 *  1. Parses the uploaded file into memory (multer)
 *  2. Streams it to Cloudinary
 *  3. Attaches { path, filename } to req.file for controller compatibility
 *
 * @param {string} folder - Cloudinary folder (e.g. "organizers")
 * @param {string} field  - Form field name (default: "image")
 * @param {boolean} multi - If true, handles multiple files (field name should be "images")
 * @param {number} maxCount - Max number of files when multi=true
 */
const makeCloudinaryUploader = (folder, field = "image", multi = false, maxCount = 20) => {
  const multerMiddleware = multi
    ? baseUpload.array(field, maxCount)
    : baseUpload.single(field);

  return async (req, res, next) => {
    multerMiddleware(req, res, async (err) => {
      if (err) return next(err);

      try {
        const uploadOptions = {
          folder: `defacto_camp/${folder}`,
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        };

        if (multi && req.files && req.files.length > 0) {
          // Upload all files in parallel
          const results = await Promise.all(
            req.files.map((f) => {
              const opts = {
                ...uploadOptions,
                public_id: `${Date.now()}-${f.originalname.replace(/\.[^/.]+$/, "").replace(/\s+/g, "_")}`,
              };
              return streamToCloudinary(f.buffer, opts);
            })
          );

          // Attach normalised file objects back to req.files
          req.files = results.map((r, i) => ({
            ...req.files[i],
            path: r.secure_url,
            filename: r.public_id,
          }));
        } else if (!multi && req.file) {
          const opts = {
            ...uploadOptions,
            public_id: `${Date.now()}-${req.file.originalname.replace(/\.[^/.]+$/, "").replace(/\s+/g, "_")}`,
          };
          const result = await streamToCloudinary(req.file.buffer, opts);
          req.file.path = result.secure_url;
          req.file.filename = result.public_id;
        }

        next();
      } catch (uploadErr) {
        next(uploadErr);
      }
    });
  };
};

// Pre-built uploaders for each resource
const organizerUpload = {
  single: (field = "image") => makeCloudinaryUploader("organizers", field),
};
const volunteerUpload = {
  single: (field = "image") => makeCloudinaryUploader("volunteers", field),
};
const playerUpload = {
  single: (field = "profileImage") => makeCloudinaryUploader("players", field),
};
const galleryUpload = {
  single: (field = "image") => makeCloudinaryUploader("gallery", field),
  array: (field = "images", max = 20) => makeCloudinaryUploader("gallery", field, true, max),
};
const gameUpload = {
  single: (field = "image") => makeCloudinaryUploader("games", field),
};
const teamUpload = {
  single: (field = "logo") => makeCloudinaryUploader("teams", field),
};

module.exports = {
  organizerUpload,
  volunteerUpload,
  playerUpload,
  galleryUpload,
  gameUpload,
  teamUpload,
  streamToCloudinary,
};
