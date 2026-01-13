import dotenv from 'dotenv';
dotenv.config();
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import mime from 'mime-types';

// configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const mimeType = mime.lookup(localFilePath);
    const isImage = mimeType && mimeType.startsWith('image/');

    // Force correct resource type
    const resourceType = isImage ? 'image' : 'raw';

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: resourceType,
      folder: 'resumes',
      use_filename: true,
      unique_filename: true,
    });
    try {
      const info = await cloudinary.api.resource(response.public_id, { resource_type: response.resource_type || 'raw' });
      console.log('Cloudinary resource info:', JSON.stringify(info, null, 2));
    } catch (e) {
      console.warn('Could not fetch resource info:', e.message);
    }

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    return null;
  }
};

// const uploadOnCloudinary = async (localFilePath) => {
//   try {
//     if (!localFilePath) return null;

//     // Detect file type
//     const mimeType = mime.lookup(localFilePath);

//     // For non-image files (PDF, Excel, etc.) use 'raw'
//     const resourceType = mimeType && mimeType.startsWith('image/') ? 'image' : 'raw';

//     const response = await cloudinary.uploader.upload(localFilePath, {
//       resource_type: resourceType,
//       timeout: 10000,
//     });

//     console.log('File uploaded on cloudinary:', response.secure_url);

//     fs.unlinkSync(localFilePath); // delete local copy
//     return response;
//   } catch (error) {
//     console.error('Error uploading to Cloudinary:', error);
//     fs.unlinkSync(localFilePath);
//     return null;
//   }
// };

// const uploadOnCloudinary = async (localFilePath) => {
//   try {
//     if (!localFilePath) return null;

//     const response = await cloudinary.uploader.upload(localFilePath, {
//       resource_type: 'auto', // handles images, pdfs, docs, etc.
//       timeout: 20000,
//     });

//     console.log(' File uploaded on cloudinary:', response.secure_url);

//     fs.unlinkSync(localFilePath);
//     return response;
//   } catch (error) {
//     console.error(' Error uploading to Cloudinary:', error);
//     if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
//     return null;
//   }
// };

const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('File deleted from cloudinary', result);
  } catch (error) {
    console.log('error deleting file from cloudinary', error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
