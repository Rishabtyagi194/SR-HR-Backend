import uploadService from '../services/uploadService.js';

export const uploadEmployeeData = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Excel file is required.' });
    }

    const user = req.user;
    const filePath = req.file.path;

    const result = await uploadService.processExcelFile(filePath, user);

    res.status(200).json({
      message: 'Data uploaded successfully.',
      ...result,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const listUploadedData = async (req, res) => {
  try {
    const user = req.user;
    const data = await uploadService.listUploadedData(user);

    res.status(200).json({
      message: 'Uploaded data fetched successfully.',
      total: data.length,
      uploads: data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update one record by ID
export const updateRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body; // fields to update

    const result = await uploadService.updateRecordById(req.user, id, updateData);
    res.status(200).json({ message: 'Record updated successfully', result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete one record by ID
export const deleteRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    await uploadService.deleteRecordById(req.user, id);
    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
