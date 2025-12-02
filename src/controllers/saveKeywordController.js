import { saveSearchKeyword } from '../services/searchKeywordService.js';

export const saveKeywordController = async (req, res) => {
  try {
    const { keyword } = req.body;
    const employerId = req.user.id;

    if (!keyword) return res.status(400).json({ message: 'Keyword required' });

    await saveSearchKeyword(employerId, keyword);

    return res.json({ success: true, message: 'Keyword stored' });
  } catch (err) {
    console.error('Save keyword error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
