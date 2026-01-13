import { uploadBaseForUser } from './baseUploader.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload / update user resume
 * - Always uploads a new file
 * - Old resume is deleted AFTER DB update
 */
export const uploadUserResume = async (localFilePath, userId) => {
  const publicId = `res_user_${userId}_${uuidv4()}`;

  return uploadBaseForUser({
    localFilePath,
    folder: 'user_resumes',
    publicId,
    overwrite: true,
  });
};
