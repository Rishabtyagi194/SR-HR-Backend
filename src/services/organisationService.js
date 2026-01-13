// src/services/organisationService.js
import OrganisationQueries from '../queries/organsiationQueries.js';
import EmployerQueries from '../queries/employerQueries.js';

class OrganisationService {
  async registerOrganisationAndEmployer(organisationData, userData) {
    // Create organisation
    const organisation = await OrganisationQueries.create(organisationData);

    // Create employer admin
    const employerUser = await EmployerQueries.create({
      ...userData,
      organisation_id: organisation.id,
    });

    // console.log('organisation.id, employerUser.id', organisation.id, employerUser.id);

    if (!employerUser || !employerUser.id) {
      throw new Error('Employer user not created correctly');
    }

    // Update organisation with admin user ID
    await OrganisationQueries.updateAdminUserId(organisation.id, employerUser.id);

    return { organisation, employerUser };
  }

  async getAllorganisations(queryParams) {
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 10;
    const offset = (page - 1) * limit;

    return await OrganisationQueries.findAll(queryParams, {
      page,
      limit,
      offset,
      sortBy: queryParams.sortBy || 'created_at',
      order: queryParams.order || 'desc',
    });
  }
}

export default new OrganisationService();
