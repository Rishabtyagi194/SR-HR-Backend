// src/models/jobs.model.js

class Internship {
  constructor({
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
    jobDescription,
    lastDateToApply,
    collabrateWithTeam,
    receivedResponseOverMail,
    addResponseCode,
    AboutCompany,
    postedBy,
    posted_by_email,
    is_consultant_Job_Active = false,
    Status = 'draft',
    organisation_id,
    consultant_agency_id,
    employer_id,
    consultant_user_id,
    staff_id,
    id,
    created_at,
    updated_at,
  }) {
    // Basic job information
    this.internshipTitle = internshipTitle;
    this.employmentType = employmentType;
    this.duration = duration;
    this.internshipStartDate = internshipStartDate;
    this.workMode = workMode;
    this.OfferStipend = OfferStipend;
    this.intershipLocation = intershipLocation;
    this.willingToRelocate = willingToRelocate;
    this.CompanyIndustry = CompanyIndustry;
    this.perksAndBenefit = perksAndBenefit;
    this.noOfVacancies = noOfVacancies;
    this.skills = skills;
    this.qualification = qualification;
    this.videoProfile = videoProfile;
    this.jobDescription = jobDescription;
    this.lastDateToApply = lastDateToApply;
    this.collabrateWithTeam = collabrateWithTeam;
    this.receivedResponseOverMail = receivedResponseOverMail;
    this.addResponseCode = addResponseCode;
    this.AboutCompany = AboutCompany;

    // Status and relationships
    this.postedBy = postedBy;
    this.posted_by_email = posted_by_email;
    this.is_consultant_Job_Active = is_consultant_Job_Active;
    this.Status = Status;
    this.organisation_id = organisation_id;
    this.consultant_agency_id = consultant_agency_id;
    this.employer_id = employer_id;
    this.consultant_user_id = consultant_user_id;
    this.staff_id = staff_id;

    // Optional fields (for existing records)
    this.id = id;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  // Method to get sanitized data for database insertion
  toDatabaseObject() {
    return {
      internshipTitle: this.internshipTitle,
      employmentType: this.employmentType,
      duration: this.duration,
      internshipStartDate: this.internshipStartDate,
      OfferStipend: this.OfferStipend,
      workMode: this.workMode,
      intershipLocation: JSON.stringify(this.intershipLocation || {}),
      willingToRelocate: this.willingToRelocate || false,
      CompanyIndustry: this.CompanyIndustry,
      perksAndBenefit: this.perksAndBenefit || [],
      noOfVacancies: this.noOfVacancies,
      skills: JSON.stringify(this.skills || []),
      qualification: JSON.stringify(this.qualification || []),
      videoProfile: this.videoProfile || false,
      jobDescription: this.jobDescription,
      lastDateToApply: this.lastDateToApply,
      collabrateWithTeam: this.collabrateWithTeam,
      receivedResponseOverMail: this.receivedResponseOverMail,
      addResponseCode: this.addResponseCode,
      AboutCompany: this.AboutCompany,
      postedBy: this.postedBy,
      posted_by_email: this.posted_by_email,
      is_consultant_Job_Active: this.is_consultant_Job_Active,
      Status: this.Status,
      organisation_id: this.organisation_id,
      consultant_agency_id: this.consultant_agency_id,
      employer_id: this.employer_id,
      consultant_user_id: this.consultant_user_id,
      staff_id: this.staff_id,
    };
  }

  // Static method to create instance from database row
  static fromDatabaseRow(row) {
    return new Internship({
      ...row,
      duration: typeof row.duration === 'string' ? JSON.parse(row.duration) : row.duration,
      intershipLocation: typeof row.intershipLocation === 'string' ? JSON.parse(row.intershipLocation) : row.intershipLocation,
      qualification: typeof row.qualification === 'string' ? JSON.parse(row.qualification) : row.qualification,
      willingToRelocate: Boolean(row.willingToRelocate),
    });
  }
}

export default Internship;
