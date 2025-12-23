// config/database.js
import mysql from 'mysql2/promise';

// Read/Write Replica Setup
let writePool;
let readPool;

export const getWritePool = () => {
  if (!writePool) {
    writePool = mysql.createPool({
      host: process.env.DB_MASTER_HOST || process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '50', 10),
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }
  return writePool;
};

export const getReadPool = () => {
  if (!readPool) {
    readPool = mysql.createPool({
      host: process.env.DB_REPLICA_HOST || process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '50', 10),
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }
  return readPool;
};

// Create database if not exists
const createDatabaseIfNotExists = async () => {
  const dbConfigs = [
    { name: 'MASTER', host: process.env.DB_MASTER_HOST || process.env.DB_HOST },
    { name: 'REPLICA', host: process.env.DB_REPLICA_HOST || process.env.DB_HOST },
  ];

  for (const cfg of dbConfigs) {
    try {
      const tempConfig = {
        host: cfg.host,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      };

      const connection = await mysql.createConnection(tempConfig);
      await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
      await connection.end();

      console.log(`Database ${process.env.DB_NAME} created or exists on ${cfg.name} (${cfg.host})`);
    } catch (error) {
      console.error(`Failed to create database on ${cfg.name} (${cfg.host}):`, error.message);
    }
  }
};

// Initialize all required tables
export const initializeDatabase = async () => {
  try {
    await createDatabaseIfNotExists();

    const pool = getWritePool();
    const connection = await pool.getConnection();

    console.log(' Creating database tables...');

    // Subscription categories
    // await connection.execute(`
    //   CREATE TABLE IF NOT EXISTS subscription_categories (
    //     id INT AUTO_INCREMENT PRIMARY KEY,
    //     name VARCHAR(255) NOT NULL,
    //     slug VARCHAR(255) UNIQUE NOT NULL,
    //     description TEXT,
    //     is_active BOOLEAN DEFAULT TRUE,
    //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    //   )
    // `);

    // Plan options
    // await connection.execute(`
    //   CREATE TABLE IF NOT EXISTS plan_options (
    //     id INT AUTO_INCREMENT PRIMARY KEY,
    //     category_id INT,
    //     name VARCHAR(255) NOT NULL,
    //     slug VARCHAR(255) NOT NULL,
    //     price DECIMAL(10,2) NOT NULL,
    //     currency VARCHAR(10) DEFAULT 'INR',
    //     validity_days INT NOT NULL,
    //     job_location_limit INT DEFAULT 1,
    //     job_apply_limit INT DEFAULT 0,
    //     features JSON,
    //     is_active BOOLEAN DEFAULT TRUE,
    //     metadata JSON,
    //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //     FOREIGN KEY (category_id) REFERENCES subscription_categories(id) ON DELETE CASCADE
    //   )
    // `);

    //  Admins users
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('super_admin', 'system') DEFAULT 'super_admin',
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_phone (phone)
      )
    `);

    // ompanies
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        industry VARCHAR(255),
        size VARCHAR(50),
        website VARCHAR(255),
        logo_url VARCHAR(500),
        contact_email VARCHAR(255) NOT NULL,
        contact_phone VARCHAR(20),
        address TEXT,
        verified BOOLEAN DEFAULT FALSE,
        status ENUM('active', 'suspended', 'deleted') DEFAULT 'active',
        admin_user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_status (status)
      )
    `);

    //  Employer users and its sub user
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS employer_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL,
        employer_id INT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20) UNIQUE,
        role ENUM('employer_admin', 'employer_staff') DEFAULT 'employer_admin',
        permissions JSON,
        is_active BOOLEAN DEFAULT FALSE,
        email_otp VARCHAR(10),
        otp_expires_at DATETIME,
        last_login TIMESTAMP NULL,
        login_history JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        INDEX idx_email (email),
        INDEX idx_phone (phone)
      )
    `);

    // // Add foreign key for companies.admin_user_id now that employer_users exists
    // await connection
    //   .execute(
    //     `
    //   ALTER TABLE companies
    //   ADD CONSTRAINT fk_admin_user
    //   FOREIGN KEY (admin_user_id) REFERENCES employer_users(id) ON DELETE SET NULL
    // `,
    //   )
    //   .catch((err) => {
    //     if (err.code !== 'ER_DUP_KEYNAME' && err.code !== 'ER_CANT_CREATE_TABLE') {
    //       throw err;
    //     }
    //   });

    // Hot Vacancy jobs Table
    await connection.execute(`
          CREATE TABLE IF NOT EXISTS HotVacancyJobs (
          job_id INT AUTO_INCREMENT PRIMARY KEY,
          company_id INT,
          employer_id INT,
          staff_id INT,
          category VARCHAR(255) DEFAULT 'HotVacancy',
          jobTitle VARCHAR(255),
          employmentType VARCHAR(255),
          skills JSON,
          CompanyIndustry VARCHAR(255),
          workMode VARCHAR(255),
          jobLocation JSON,
          willingToRelocate Boolean,
          locality VARCHAR(255),
          experinceFrom VARCHAR(255),
          experinceTo VARCHAR(255),
          salaryRangeFrom VARCHAR(255),
          salaryRangeTo VARCHAR(255),
          qualification JSON,
          jobDescription TEXT,
          AboutCompany TEXT,
          
          -- Walk-in details fields
          include_walk_in_details BOOLEAN DEFAULT FALSE,
          walk_in_start_date DATE,
          duration_days INT DEFAULT 1,
          walk_in_start_time TIME,
          walk_in_end_time TIME,
          contact_person VARCHAR(255),
          contact_number VARCHAR(20),
          venue TEXT,
          google_maps_url VARCHAR(500),
          
          -- Questions field (store as JSON to handle multiple questions)
          
          questions JSON,
          
          postedBy VARCHAR(255),
          Status ENUM('active', 'draft', 'disable') DEFAULT 'draft',
          FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // Internship jobs Table
    await connection.execute(`
          CREATE TABLE IF NOT EXISTS InternshipJobs (
          job_id INT AUTO_INCREMENT PRIMARY KEY,
          company_id INT,
          employer_id INT,
          staff_id INT,
          category VARCHAR(255) DEFAULT 'Internship',
          internshipTitle VARCHAR(255),
          employmentType VARCHAR(255),
          duration VARCHAR(255),
          internshipStartDate VARCHAR(255),
          OfferStipend VARCHAR(255),
          workMode VARCHAR(255),
          intershipLocation JSON,
          willingToRelocate Boolean,
          CompanyIndustry VARCHAR(255),
          perksAndBenefit VARCHAR(255),
          noOfVacancies VARCHAR(255),
          skills JSON,
          qualification VARCHAR(255),
          videoProfile VARCHAR(255),
          jobDescription TEXT,
          lastDateToApply VARCHAR(255),
          collabrateWithTeam JSON,
          receivedResponseOverMail VARCHAR(20),
          addResponseCode VARCHAR(255),
          AboutCompany TEXT,
          
          postedBy VARCHAR(255),
          Status ENUM('active', 'draft', 'disable') DEFAULT 'draft',
          FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    //  *******************  For users (client) ****************************

    //  users
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20) UNIQUE,
        role ENUM('job_seeker', 'admin') DEFAULT 'job_seeker',
        email_otp VARCHAR(10),
        is_mobile_verified BOOLEAN DEFAULT FALSE,
        is_email_verified BOOLEAN DEFAULT FALSE,
        otp_expires_at DATETIME,
        is_active BOOLEAN DEFAULT FALSE,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_phone (phone)
      )
    `);

    // user profile
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        dob DATE DEFAULT NULL,
        gender ENUM('male', 'female', 'other') DEFAULT NULL,
        address VARCHAR(255) DEFAULT NULL,
        city VARCHAR(255) DEFAULT NULL,
        state VARCHAR(255) DEFAULT NULL,
        country VARCHAR(255) DEFAULT NULL,
        pincode VARCHAR(20) DEFAULT NULL,
        profile_completion INT DEFAULT 0,
        profile_title VARCHAR(255),
        about_me TEXT,
        is_pwd BOOLEAN DEFAULT FALSE,
        current_location VARCHAR(255),
        preferred_location VARCHAR(255),
        willingToRelocate BOOLEAN DEFAULT FALSE,
        total_experience_years INT DEFAULT 0,
        total_experience_months INT DEFAULT 0,
        notice_period VARCHAR(50),
        current_salary VARCHAR(50),
        expected_salary VARCHAR(50),
        resume_url VARCHAR(500),
        resume_public_id VARCHAR(255),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // users educations
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_education (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        degree VARCHAR(255),
        specialization VARCHAR(255),
        institute_name VARCHAR(255),
        start_year YEAR,
        end_year YEAR,
        percentage DECIMAL(5,2),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      )
    `);

    // user experience
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_experience (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        department VARCHAR(255),
        industry VARCHAR(255),
        company_name VARCHAR(255),
        job_title VARCHAR(255),
        job_type VARCHAR(255),
        employment_type VARCHAR(255),
        start_date DATE,
        end_date DATE,
        currently_working BOOLEAN DEFAULT FALSE,
        description TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      )
    `);

    // users skills
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_skills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        skill_name VARCHAR(255) NOT NULL,
        proficiency_level ENUM('beginner', 'intermediate', 'advanced', 'expert'),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_skill (skill_name)
      )
    `);

    // JObs applications/response
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS job_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        employer_id INT,
        company_id INT,
        hotvacancy_job_id INT NULL,
        internship_job_id INT NULL,
        job_category ENUM('HotVacancy', 'Internship') DEFAULT 'HotVacancy',
        application_status ENUM('applied', 'viewed', 'shortlisted', 'rejected', 'hired') DEFAULT 'applied',
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (hotvacancy_job_id) REFERENCES HotVacancyJobs(job_id) ON DELETE CASCADE,
        FOREIGN KEY (internship_job_id) REFERENCES InternshipJobs(job_id) ON DELETE CASCADE,
        FOREIGN KEY (employer_id) REFERENCES employer_users(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,

        -- Optimized indexes for scalability
        INDEX idx_user (user_id),
        INDEX idx_company (company_id),
        INDEX idx_hotvacancy_job (hotvacancy_job_id),
        INDEX idx_internship_job (internship_job_id),
        INDEX idx_company_job (company_id, hotvacancy_job_id, internship_job_id)
      )
    `);

    // JObs applications/response answer
    await connection.execute(`
         CREATE TABLE IF NOT EXISTS job_application_answers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          application_id INT NOT NULL,
          question_text TEXT NOT NULL,
          answer_text TEXT,
          FOREIGN KEY (application_id) REFERENCES job_applications(id) ON DELETE CASCADE
        )
    `);

    // upload data by employer, excel docs
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Excel_data_uploads (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL,
        uploaded_by INT NOT NULL,
        uploaded_by_role ENUM('employer_admin', 'employer_staff') NOT NULL,
        data_json JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES employer_users(id) ON DELETE CASCADE,
        INDEX idx_company_id (company_id),
        INDEX idx_uploaded_by (uploaded_by)
      )
    `);

    //  Logs (MySQL + Redis)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(50),
        ip_address VARCHAR(50),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      )
    `);

    /*
        Redis integration tip :
      - Use Redis for real-time logs or activity caching:
        await redis.lPush(`user:${userId}:logs`, JSON.stringify({ action: 'login', time: Date.now() }));
      - Keep MySQL logs for permanent storage and audits.
    */

    // ***************** Employer upload resume on dashboard **********************

    await connection.execute(`
        CREATE TABLE IF NOT EXISTS resumes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(50) NOT NULL UNIQUE,
        file_path VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email_phone (email, phone)
      );
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS resume_skills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        resume_id INT NOT NULL,
        skill_name VARCHAR(255) NOT NULL,
        FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
        INDEX idx_resume_id (resume_id),
        INDEX idx_skill_name (skill_name)      
      );
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS resume_education (
        id INT AUTO_INCREMENT PRIMARY KEY,
        resume_id INT NOT NULL,
        degree VARCHAR(255),
        institution VARCHAR(255),
        year VARCHAR(50),
        FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
        INDEX idx_resume_id (resume_id)
      );
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS resume_experience (
        id INT AUTO_INCREMENT PRIMARY KEY,
        resume_id INT NOT NULL,
        company VARCHAR(255),
        position VARCHAR(255),
        duration VARCHAR(100),
        description TEXT,
        FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
        INDEX idx_resume_id (resume_id)
      );
    `);

    await connection.execute(`
        CREATE TABLE IF NOT EXISTS search_keywords_history (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        employer_id INT NOT NULL,
        keyword VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employer_id) REFERENCES employer_users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_keyword (keyword),
        INDEX idx_keyword (keyword)
      );
    `);

    // *************************************** saved jobs ***********************************

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS saved_jobs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        job_id INT NOT NULL,
        job_type ENUM('HotVacancy', 'Internship') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        UNIQUE KEY unique_saved_job (user_id, job_id, job_type),

        INDEX idx_user (user_id),
        INDEX idx_job (job_id, job_type)
      ) ENGINE=InnoDB;
    `);

    connection.release();
    console.log('All database tables initialized successfully.');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

// Export both pools (read/write) and initializer
export default {
  getWritePool,
  getReadPool,
  initializeDatabase,
};
