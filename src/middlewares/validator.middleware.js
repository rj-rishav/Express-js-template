import Joi from 'joi';
import multer from 'multer';
import path from 'path';
import httpStatus from 'http-status';
import fs from 'fs';

// ApiError class for consistent error handling
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      message: this.message,
    };
  }
}

// Helper function to pick properties from an object
function pick(obj, keys) {
  return keys.reduce((acc, key) => {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}

// Simple FileJoi object with methods that return configurations rather than chained Joi validation
export const FileJoi = {
  ...Joi,
  file() {
    const config = {
      allowedTypes: [],
      maxSize: 10 * 1024 * 1024, // Default 10 MB
      maxCount: 1,
      type(types) {
        this.allowedTypes = Array.isArray(types) ? types : [types];
        return this;
      },
      size(maxSizeBytes) {
        this.maxSize = maxSizeBytes;
        return this;
      },
      maxCount(count) {
        this.maxCount = count;
        return this;
      },
    };
    return config;
  },
};

// Ensure uploads directory exists
const ensureUploadsDir = () => {
  const uploadDir = `${process.cwd()}/src/uploads/`;
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = ensureUploadsDir();
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Universal validation middleware that handles both regular validation and file uploads
export function validate(schema) {
  return async (req, res, next) => {
    try {
      // Handle file uploads if present in schema
      if (schema.files) {
        const fileFields = [];
        const fileTypes = {};
        const maxSizes = {};

        // Extract file fields and their configurations
        Object.entries(schema.files).forEach(([key, fileConfig]) => {
          if (fileConfig && typeof fileConfig === 'object') {
            fileFields.push({
              name: key,
              maxCount: fileConfig.maxCount || 1,
            });

            maxSizes[key] = fileConfig.maxSize || 5 * 1024 * 1024; // Default 5MB

            if (fileConfig.allowedTypes && fileConfig.allowedTypes.length > 0) {
              fileTypes[key] = fileConfig.allowedTypes;
            }
          }
        });

        // Configure file filter based on file types
        const fileFilter = (req, file, cb) => {
          if (fileTypes[file.fieldname]) {
            const allowedTypes = fileTypes[file.fieldname];
            const fileExt = path.extname(file.originalname).toLowerCase().substring(1);
            const mimeType = file.mimetype.split('/')[1];

            if (allowedTypes.includes(fileExt) || allowedTypes.includes(mimeType)) {
              return cb(null, true);
            }
            return cb(
              new ApiError(
                httpStatus.BAD_REQUEST,
                `File type not allowed for ${file.fieldname}. Allowed types: ${allowedTypes.join(', ')}`
              ),
              false
            );
          }
          // No type restriction specified
          return cb(null, true);
        };

        // If there are file fields, configure Multer
        if (fileFields.length > 0) {
          // Create folder if it doesn't exist
          ensureUploadsDir();

          const upload = multer({
            storage,
            fileFilter,
            limits: {
              fileSize: Math.max(...Object.values(maxSizes), 5 * 1024 * 1024), // Use max file size with 5MB default
            },
          });

          // Create fields array for Multer
          const fields = fileFields.map((field) => ({
            name: field.name,
            maxCount: field.maxCount,
          }));

          // Handle file uploads
          try {
            await new Promise((resolve, reject) => {
              upload.fields(fields)(req, res, (err) => {
                if (err) {
                  if (err instanceof multer.MulterError) {
                    return reject(
                      new ApiError(httpStatus.BAD_REQUEST, `File upload error: ${err.message}`)
                    );
                  }
                  return reject(err);
                }
                resolve();
              });
            });
          } catch (uploadError) {
            // Send JSON response for upload errors
            return res.status(uploadError.statusCode || httpStatus.BAD_REQUEST).json({
              statusCode: uploadError.statusCode || httpStatus.BAD_REQUEST,
              message: uploadError.message || 'File upload error',
            });
          }

          // Additional validation for file sizes after upload
          if (req.files) {
            for (const [fieldName, files] of Object.entries(req.files)) {
              for (const file of files) {
                if (file.size > maxSizes[fieldName]) {
                  // Remove the uploaded file
                  fs.unlinkSync(file.path);

                  // Send JSON response for file size errors
                  return res.status(httpStatus.BAD_REQUEST).json({
                    statusCode: httpStatus.BAD_REQUEST,
                    message: `File ${file.originalname} exceeds maximum size limit of ${maxSizes[fieldName] / (1024 * 1024)}MB`,
                  });
                }
              }
            }
          }
        }
      }

      // Handle regular Joi validation (params, query, body)
      let validSchema;

      if (schema.body || schema.params || schema.query) {
        // For schemas with explicit body, params, query
        validSchema = pick(schema, ['params', 'query', 'body']);
      } else if (typeof schema === 'object' && !schema.files) {
        // For bare Joi objects (common pattern in most validation files)
        validSchema = schema;
      } else {
        // Default case, try to extract what we can
        validSchema = pick(schema, ['params', 'query', 'body']);
      }

      const object = pick(req, Object.keys(validSchema));

      const { value, error } = Joi.compile(validSchema)
        .prefs({
          errors: { label: 'key' },
          abortEarly: false,
        })
        .validate(object);

      if (error) {
        const errorMessage = error.details.map((d) => d.message).join(', ');

        // Send JSON response for validation errors
        return res.status(httpStatus.BAD_REQUEST).json({
          statusCode: httpStatus.BAD_REQUEST,
          message: errorMessage,
        });
      }

      // Merge validated data back into request
      Object.assign(req, value);
      next();
    } catch (error) {
      console.error('Validation error:', error);

      // Always return JSON responses for errors
      return res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal server error during validation',
      });
    }
  };
}
