import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import mime from 'mime-types';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// Cloudinary uploader for consultant
export const uploadBase = async ({ localFilePath, publicId }) => {
  const mimeType = mime.lookup(localFilePath);
  const resourceType = mimeType?.startsWith('image/') ? 'image' : 'raw';

  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: resourceType,
      public_id: publicId, // FULL deterministic ID
      overwrite: false,    // NEVER overwrite
    });
    return result;
  } catch (err) {
    if (err.http_code === 409) {
      throw new Error('DUPLICATE_FILE');
    }
    throw err;
  } finally {
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
  }
};

// Cloudinary uploader for user profile resume
export const uploadBaseForUser = async ({
  localFilePath,
  folder,
  publicId,
  overwrite = false,
}) => {
  if (!localFilePath) {
    throw new Error('File path missing');
  }

  const mimeType = mime.lookup(localFilePath);
  const resourceType = mimeType?.startsWith('image/') ? 'image' : 'raw';

  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: resourceType,
      folder,
      public_id: publicId, // full public_id including folder
      overwrite,
    });

    return result;
  } catch (error) {
    if (error.http_code === 409) {
      throw new Error('DUPLICATE_FILE');
    }
    throw error;
  } finally {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw',
    });
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return null;
  }
};
