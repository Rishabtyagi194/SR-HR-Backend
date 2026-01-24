import organisationService from '../services/organisationService.js';

export const registerOrganisationAndEmployers = async (req, res) => {
  try {
    const { organisationData, userData } = req.body;
    //  console.log('HEADERS:', req.headers['content-type']);
    // console.log('BODY:', req.body);

    const result = await organisationService.registerOrganisationAndEmployer(organisationData, userData);

    return res.status(201).json({
      message: 'organisation and employer admin created successfully',
      ...result,
    });
  } catch (err) {
    console.error('Register organisation And Admin error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const fetchAllorganisations = async (req, res) => {
  try {
    const result = await organisationService.getAllorganisations(req.query);

    return res.status(200).json({
      message: 'organisations fetched successfully',
      // count: result.organisations.length,
      totalorganisations: result.total,
      totalPages: Math.ceil(result.total / (parseInt(req.query.limit) || 10)),
      currentPage: parseInt(req.query.page) || 1,
      organisations: result.organisations,
    });
  } catch (err) {
    console.error('getAllorganisations error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
