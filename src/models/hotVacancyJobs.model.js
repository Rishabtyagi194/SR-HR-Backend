// src/models/jobs.model.js

class Jobs {
  constructor({
    jobTitle,
    employmentType,
    skills,
    CompanyIndustry,
    workMode,
    jobLocation,
    willingToRelocate,
    locality,
    experinceFrom,
    experinceTo,
    salaryRangeFrom,
    salaryRangeTo,
    qualification,
    jobDescription,
    AboutCompany,

    // Walk-in details fields
    include_walk_in_details = false,
    walk_in_start_date,
    duration_days = 1,
    walk_in_start_time,
    walk_in_end_time,
    contact_person,
    venue,
    google_maps_url,
    contact_number,

    // Questions field
    questions = [],

    Status = 'draft',
    company_id,
    employer_id,
    staff_id,
    id,
    created_at,
    updated_at,
  }) {
    // Basic job information
    this.jobTitle = jobTitle;
    this.employmentType = employmentType;
    this.skills = skills;
    this.CompanyIndustry = CompanyIndustry;
    this.workMode = workMode;
    this.jobLocation = jobLocation;
    this.willingToRelocate = willingToRelocate;
    this.locality = locality;
    this.experinceFrom = experinceFrom;
    this.experinceTo = experinceTo;
    this.salaryRangeFrom = salaryRangeFrom;
    this.salaryRangeTo = salaryRangeTo;
    this.qualification = qualification;
    this.jobDescription = jobDescription;
    this.AboutCompany = AboutCompany;

    // Walk-in details
    this.include_walk_in_details = include_walk_in_details;
    this.walk_in_start_date = walk_in_start_date;
    this.walk_in_start_time = walk_in_start_time;
    this.walk_in_end_time = walk_in_end_time;
    this.contact_person = contact_person;
    this.venue = venue;
    this.google_maps_url = google_maps_url;
    this.duration_days = duration_days;
    this.contact_number = contact_number;

    // Questions
    this.questions = questions;

    // Status and relationships
    this.Status = Status;
    this.company_id = company_id;
    this.employer_id = employer_id;
    this.staff_id = staff_id;

    // Optional fields (for existing records)
    this.id = id;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  // Method to get sanitized data for database insertion
  toDatabaseObject() {
    return {
      jobTitle: this.jobTitle,
      employmentType: this.employmentType,
      skills: JSON.stringify(this.skills || []),
      CompanyIndustry: this.CompanyIndustry,
      workMode: this.workMode,
      jobLocation: JSON.stringify(this.jobLocation || {}),
      willingToRelocate: this.willingToRelocate || false,
      locality: this.locality,
      experinceFrom: this.experinceFrom,
      experinceTo: this.experinceTo,
      salaryRangeFrom: this.salaryRangeFrom,
      salaryRangeTo: this.salaryRangeTo,
      qualification: JSON.stringify(this.qualification || []),
      jobDescription: this.jobDescription,
      AboutCompany: this.AboutCompany,
      include_walk_in_details: this.include_walk_in_details,
      walk_in_start_date: this.walk_in_start_date,
      walk_in_start_time: this.walk_in_start_time,
      walk_in_end_time: this.walk_in_end_time,
      contact_person: this.contact_person,
      venue: this.venue,
      google_maps_url: this.google_maps_url,
      duration_days: this.duration_days,
      contact_number: this.contact_number,
      questions: JSON.stringify(this.questions || []),
      Status: this.Status,
      company_id: this.company_id,
      employer_id: this.employer_id,
      staff_id: this.staff_id,
    };
  }

  // Static method to create instance from database row
  static fromDatabaseRow(row) {
    return new Jobs({
      ...row,
      skills: typeof row.skills === 'string' ? JSON.parse(row.skills) : row.skills,
      jobLocation: typeof row.jobLocation === 'string' ? JSON.parse(row.jobLocation) : row.jobLocation,
      qualification: typeof row.qualification === 'string' ? JSON.parse(row.qualification) : row.qualification,
      questions: typeof row.questions === 'string' ? JSON.parse(row.questions) : row.questions,
      willingToRelocate: Boolean(row.willingToRelocate),
      include_walk_in_details: Boolean(row.include_walk_in_details),
      duration_days: row.duration_days || 1,
    });
  }
}

export default Jobs;

// class Jobs {
//   constructor({
//     jobTitle,
//     employmentType,
//     workMode,
//     jobLocation,
//     locality,
//     experinceFrom,
//     experinceTo,
//     salaryRangeFrom,
//     salaryRangeTo,
//     qualification,
//     jobDescription,
//     Status,
//   }) {
//     (this.jobTitle = jobTitle),
//       (this.employmentType = employmentType),
//       (this.workMode = workMode),
//       (this.jobLocation = jobLocation),
//       (this.locality = locality),
//       (this.experinceFrom = experinceFrom),
//       (this.experinceTo = experinceTo),
//       (this.salaryRangeFrom = salaryRangeFrom),
//       (this.salaryRangeTo = salaryRangeTo),
//       (this.qualification = qualification),
//       (this.jobDescription = jobDescription);
//     this.Status = Status;
//   }
// }

// export default Jobs;
