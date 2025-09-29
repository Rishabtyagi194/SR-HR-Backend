// src/services/companyService.js
import CompanyQueries from '../queries/companyQueries.js';
import EmployerQueries from '../queries/employerQueries.js';

class CompanyService {
  async createCompanyAndEmployer(companyData, userData) {
    // Create company
    const company = await CompanyQueries.create(companyData);

    // Create employer admin
    const employerUser = await EmployerQueries.create({
      ...userData,
      company_id: company.id,
      role: 'employer_admin',
    });

    console.log('company.id, employerUser.id', company.id, employerUser.id);

    if (!employerUser || !employerUser.id) {
      throw new Error('Employer user not created correctly');
    }

    // Update company with admin user ID
    await CompanyQueries.updateAdminUserId(company.id, employerUser.id);

    return { company, employerUser };
  }

  async getAllCompanies(queryParams) {
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 10;
    const offset = (page - 1) * limit;

    return await CompanyQueries.findAll(queryParams, {
      page,
      limit,
      offset,
      sortBy: queryParams.sortBy || 'created_at',
      order: queryParams.order || 'desc',
    });
  }
}

export default new CompanyService();
