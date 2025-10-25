import companyService from '../services/companyService.js';

export const createCompanyAndEmployer = async (req, res) => {
  try {
    const { companyData, userData } = req.body;

    const result = await companyService.createCompanyAndEmployer(companyData, userData);

    return res.status(201).json({
      message: 'Company and employer admin created successfully',
      ...result,
    });
  } catch (err) {
    console.error('createCompanyAndAdmin error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const fetchAllCompanies = async (req, res) => {
  try {
    const result = await companyService.getAllCompanies(req.query);

    return res.status(200).json({
      message: 'Companies fetched successfully',
      // count: result.companies.length,
      totalCompanies: result.total,
      totalPages: Math.ceil(result.total / (parseInt(req.query.limit) || 10)),
      currentPage: parseInt(req.query.page) || 1,
      companies: result.companies,
    });
  } catch (err) {
    console.error('getAllCompanies error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
