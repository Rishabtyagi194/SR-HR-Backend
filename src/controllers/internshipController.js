import internshipJobsServices from '../services/internshipJobsServices.js';

export const createInternshipJobsController = async (req, res) => {
  try {
    const user = req.user;

    const {
      internshipTitle,
      employmentType,
      duration,
      internshipStartDate,
      OfferStipend,
      workMode,
      intershipLocation,
      willingToRelocate,
      CompanyIndustry,
      perksAndBenefit,
      noOfVacancies,
      skills,
      qualification,
      videoProfile,
      lastDateToApply,
      jobDescription,
      collabrateWithTeam,
      receivedResponseOverMail,
      addResponseCode,
      AboutCompany,
    } = req.body;

    // base payload
    let jobPayload = {
      company_id: user.company_id,
      internshipTitle,
      employmentType,
      duration,
      internshipStartDate,
      OfferStipend,
      workMode,
      intershipLocation,
      willingToRelocate,
      CompanyIndustry,
      perksAndBenefit,
      noOfVacancies,
      skills,
      qualification,
      videoProfile,
      lastDateToApply,
      jobDescription,
      collabrateWithTeam,
      receivedResponseOverMail,
      addResponseCode,
      AboutCompany,
    };

    // role-based assignment
    if (user.role === 'employer_admin') {
      jobPayload.employer_id = user.id;
      jobPayload.staff_id = null;
    } else if (user.role === 'employer_staff') {
      jobPayload.staff_id = user.id;
      jobPayload.employer_id = null;
    } else {
      return res.status(403).json({ message: 'unauthorized role to create jobs' });
    }

    const result = await internshipJobsServices.createInternship(jobPayload);

    return res.status(201).json({
      message: 'Successfully posted job',
      job: result,
    });
  } catch (error) {
    console.error('create internship Controller error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const ListAllInternshipJobsController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { jobs, total } = await internshipJobsServices.listAllInternship(page, limit);

    return res.status(200).json({
      message: 'Jobs fetched successfully',
      totalJobs: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      AllJobs: jobs,
    });
  } catch (error) {
    console.error('ListAllJobsController error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getInternshipJobsByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await internshipJobsServices.getinternshipById(id);

    if (!result) {
      return res.status(404).json({ message: 'Job not found' });
    }

    return res.status(200).json({
      message: 'Job fetched successfully',
      job: result,
    });
  } catch (error) {
    console.error('getJobsByIdController error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
export const updateInternshipJobsController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body; // fields to update

    const result = await internshipJobsServices.updateInternship(id, updateData);

    if (!result) {
      return res.status(404).json({ message: 'Job not found' });
    }

    return res.status(200).json({
      message: 'Job updated successfully',
      job: result,
    });
  } catch (error) {
    console.error('updateJobsController error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteInternshipJobsController = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await internshipJobsServices.deleteInternship(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Job not found' });
    }

    return res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('deleteJobsController error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
