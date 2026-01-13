// import crypto from 'crypto';
// import fs from 'fs';
// import { uploadBase } from './baseUploader.js';

// const generateHash = (filePath) => {
//   const buffer = fs.readFileSync(filePath);
//   return crypto.createHash('sha256').update(buffer).digest('hex');
// };

// export const uploadConsultantResume = async (filePath) => {
//   const hash = generateHash(filePath);

//   return uploadBase({
//     localFilePath: filePath,
//     publicId: `consultant_resumes/${hash}`, // deterministic
//   });
// };

// utils/cloudinary/consultantResumeUploader.js


import crypto from 'crypto';
import fs from 'fs';
import { uploadBase } from './baseUploader.js';

export const getFileHash = (filePath) => {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

export const uploadConsultantResume = async (filePath, hash) => {
  return uploadBase({
    localFilePath: filePath,
    publicId: `consultant_resumes/${hash}`,
  });
};
