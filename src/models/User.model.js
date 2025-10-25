export default class User {
  constructor({
    id,
    full_name,
    email,
    password,
    phone,
    created_at,
    updated_at,
    // Profile fields
    dob = null,
    gender = null,
    address = null,
    city = null,
    state = null,
    country = null,
    pincode = null,
    profile_completion = 0,
    profile_title = null,
    about_me = null,
    current_location = null,
    preferred_location = null,
    total_experience_years = 0,
    total_experience_months = 0,
    notice_period = null,
    expected_salary = null,
    resume_url = null,
  }) {
    this.id = id;
    this.full_name = full_name;
    this.email = email;
    this.password = password;
    this.phone = phone;
    this.created_at = created_at;
    this.updated_at = updated_at;

    this.dob = dob;
    this.gender = gender;
    this.address = address;
    this.city = city;
    this.state = state;
    this.country = country;
    this.pincode = pincode;
    this.profile_completion = profile_completion;
    this.profile_title = profile_title;
    this.about_me = about_me;
    this.current_location = current_location;
    this.preferred_location = preferred_location;
    this.total_experience_years = total_experience_years;
    this.total_experience_months = total_experience_months;
    this.notice_period = notice_period;
    this.expected_salary = expected_salary;
    this.resume_url = resume_url;
  }

  validateForRegister() {
    if (!this.full_name || !this.email || !this.password) {
      throw new Error('full_name, email and password are required');
    }
    return true;
  }

  toJSON() {
    const { password, ...rest } = this; // Exclude password
    return rest;
  }
}
