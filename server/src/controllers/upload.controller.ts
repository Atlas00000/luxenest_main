import { Request, Response, NextFunction } from 'express';
import { upload, getFileUrl } from '../services/upload.service';
import { sendSuccess } from '../utils/api-response';
import { BadRequestError } from '../utils/api-error';

/**
 * Upload single file
 */
export const uploadSingle = (req: Request, res: Response, next: NextFunction): void => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return next(err);
    }

    if (!req.file) {
      return next(new BadRequestError('No file uploaded'));
    }

    const fileUrl = getFileUrl(req.file.filename);

    sendSuccess(
      res,
      {
        filename: req.file.filename,
        originalName: req.file.originalname,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
      'File uploaded successfully'
    );
  });
};

/**
 * Upload multiple files
 */
export const uploadMultiple = (req: Request, res: Response, next: NextFunction): void => {
  upload.array('files', 10)(req, res, (err) => {
    if (err) {
      return next(err);
    }

    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      return next(new BadRequestError('No files uploaded'));
    }

    if (!Array.isArray(req.files)) {
      return next(new BadRequestError('Invalid files format'));
    }

    const uploadedFiles = req.files.map((file: Express.Multer.File) => {
      const filename = file.filename;
      return {
        filename,
      originalName: file.originalname,
        url: getFileUrl(filename),
      size: file.size,
      mimetype: file.mimetype,
      };
    });

    sendSuccess(res, uploadedFiles, 'Files uploaded successfully');
  });
};

