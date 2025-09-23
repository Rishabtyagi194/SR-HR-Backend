import JobVacancyModel from '../models/JobVacancy.model.js';

export const createJobVacancy = async (req, res) => {
  try {
    const {
      title,
      employmentType,
      keySkills,
      companyIndustry,
      department,
      roleCategory,
      workMode,
      jobLocation,
      locality,
      workExperience,
      annualSalaryRange,
      educationQualification,
      candidateIndustry,
      diversityHiring,
      jobDescription,
      multipleVacancies,
      includeWalkIn,
      candidateQuestions,
      notifyAIRecommended,
      notificationEmails,
      notificationFrequency,
      companyName,
      companyLegalName,
      referenceCode,
      autoRefresh,
      refreshSchedule,
    } = req.body;

    const job = await JobVacancyModel.create({
      title,
      employmentType,
      keySkills,
      companyIndustry,
      department,
      roleCategory,
      workMode,
      jobLocation,
      locality,
      workExperience,
      annualSalaryRange,
      educationQualification,
      candidateIndustry,
      diversityHiring,
      jobDescription,
      multipleVacancies,
      includeWalkIn,
      candidateQuestions,
      notifyAIRecommended,
      notificationEmails,
      notificationFrequency,
      companyName,
      companyLegalName,
      referenceCode,
      autoRefresh,
      refreshSchedule,
    });

    return res.status(201).json({
      message: 'Job vacancy created successfully',
      job,
    });
  } catch (error) {
    console.error('create job vacancy error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
