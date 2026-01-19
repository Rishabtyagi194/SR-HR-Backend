export default class User {
  constructor({
    // User core
    id,
    full_name,
    email,
    password,
    phone,
    role = 'job_seeker',

    work_status = null,
    total_experience_years = 0,
    total_experience_months = 0,

    current_salary_currency = null,
    current_salary = null,
    salary_breakdown = null,

    current_location_country = null,
    current_location = null,

    availability_to_join = null,
    Expected_last_working_day = null,

    is_mobile_verified = 0,
    is_email_verified = 0,
    is_active = 0,

    email_otp = null,
    otp_expires_at = null,
    last_login = null,

    created_at,
    updated_at,

    // Profile fields
    gender = null,
    marital_status = null,
    dob = null,
    category = null,
    work_permit_for_usa = null,
    Work_permit_for_other_countries = null,

    permanent_address = null,
    hometown = null,
    pincode = null,

    profile_title,
    resume_headline,
    profile_summary,

    profile_completion = 0,
    disability_status = null,

    key_skills = null,

    preferred_location = null,
    willingToRelocate = null,

    notice_period = null,
    expected_salary = null,

    resume_url = null,
    resume_public_id = null,
  }) {
    this.id = id;
    this.full_name = full_name;
    this.email = email;
    this.password = password;
    this.phone = phone;
    this.role = role;

    this.is_mobile_verified = Boolean(is_mobile_verified);
    this.is_email_verified = Boolean(is_email_verified);
    this.is_active = Boolean(is_active);

    this.email_otp = email_otp;
    this.otp_expires_at = otp_expires_at;
    this.last_login = last_login;

    this.work_status = work_status;
    this.total_experience_years = total_experience_years;
    this.total_experience_months = total_experience_months;

    this.current_salary_currency = current_salary_currency;
    this.current_salary = current_salary;
    this.salary_breakdown = salary_breakdown;

    this.current_location_country = current_location_country;
    this.current_location = current_location;
    this.availability_to_join = availability_to_join;
    this.Expected_last_working_day = Expected_last_working_day;

    this.created_at = created_at;
    this.updated_at = updated_at;

    // Profile
    this.gender = gender;
    this.marital_status = marital_status;
    this.dob = dob;
    this.category = category;
    this.work_permit_for_usa = work_permit_for_usa;
    this.Work_permit_for_other_countries = Work_permit_for_other_countries;
    
    this.permanent_address = permanent_address;
    this.hometown = hometown;
    this.pincode = pincode;
   
    this.profile_title = profile_title;
    this.resume_headline = resume_headline;
    this.profile_summary = profile_summary;

    this.profile_completion = profile_completion;
    this.disability_status = disability_status;
    this.key_skills = key_skills;

    this.current_location = current_location;
    this.preferred_location = preferred_location;
    this.willingToRelocate = willingToRelocate;

    this.notice_period = notice_period;
    this.expected_salary = expected_salary;

    this.resume_url = resume_url;
    this.resume_public_id = resume_public_id;
  }

  validateForRegister() {
    if (!this.full_name || !this.email || !this.password) {
      throw new Error('full_name, email and password are required');
    }
    return true;
  }

  toJSON() {
    const { password, email_otp, otp_expires_at, ...safeData } = this;

    return safeData;
  }
}

// export default class User {
//   constructor({
//     id,
//     full_name,
//     email,
//     password,
//     phone,
//     role = 'job_seeker',

//     is_mobile_verified = 0,
//     is_email_verified = 0,
//     is_active = 0,

//     created_at,
//     updated_at,
//     // Profile fields
//     dob = null,
//     gender = null,
//     address = null,
//     city = null,
//     state = null,
//     country = null,
//     pincode = null,
//     profile_completion = 0,
//     profile_title = null,
//     about_me = null,
//     is_pwd = null,
//     current_location = null,
//     preferred_location = null,
//     willingToRelocate = null,
//     total_experience_years = 0,
//     total_experience_months = 0,
//     notice_period = null,
//     current_salary = null,
//     expected_salary = null,
//     resume_url = null,
//     resume_public_id = null,
//   }) {
//     this.id = id;
//     this.full_name = full_name;
//     this.email = email;
//     this.password = password;
//     this.phone = phone;
//     this.is_mobile_verified = is_mobile_verified;
//     this.is_email_verified = is_email_verified;
//     this.created_at = created_at;
//     this.updated_at = updated_at;
//     this.is_active = is_active === 1 || is_active === false;
//     this.dob = dob;
//     this.gender = gender;
//     this.address = address;
//     this.city = city;
//     this.state = state;
//     this.country = country;
//     this.pincode = pincode;
//     this.profile_completion = profile_completion;
//     this.profile_title = profile_title;
//     this.about_me = about_me;
//     this.is_pwd = is_pwd;
//     this.current_location = current_location;
//     this.preferred_location = preferred_location;
//     this.willingToRelocate = willingToRelocate;
//     this.total_experience_years = total_experience_years;
//     this.total_experience_months = total_experience_months;
//     this.notice_period = notice_period;
//     this.current_salary = current_salary;
//     this.expected_salary = expected_salary;
//     this.resume_url = resume_url;
//     this.resume_public_id = resume_public_id;
//   }

//   validateForRegister() {
//     if (!this.full_name || !this.email || !this.password) {
//       throw new Error('full_name, email and password are required');
//     }
//     return true;
//   }

//   toJSON() {
//     const { password, ...rest } = this; // Exclude password
//     return rest;
//   }
// }
