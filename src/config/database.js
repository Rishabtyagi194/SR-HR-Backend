// src/config/database.js
import mysql from 'mysql2/promise';

// First, connect without specifying database to create it
const createDatabaseIfNotExists = async () => {
  try {
    const tempConfig = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    };

    const connection = await mysql.createConnection(tempConfig);
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await connection.end();
    console.log(`Database ${process.env.DB_NAME} created or already exists`);
    return true;
  } catch (error) {
    console.error('Failed to create database:', error.message);
    throw error;
  }
};

// Lazy pool initialization
let pool;
const getPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
};

// Initialize tables
export const initializeDatabase = async () => {
  try {
    await createDatabaseIfNotExists();
    const connectionPool = getPool();
    const connection = await connectionPool.getConnection();

    console.log('Creating database tables...');

    // Subscription categories
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS subscription_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Plan options
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS plan_options (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        validity_days INT NOT NULL,
        job_location_limit INT DEFAULT 1,
        job_apply_limit INT DEFAULT 0,
        features JSON,
        is_active BOOLEAN DEFAULT TRUE,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES subscription_categories(id) ON DELETE CASCADE
      )
    `);

    //  Admins
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

    //  Employer users
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
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT,
    employer_id INT,
    staff_id INT,
    jobTitle VARCHAR(255),
    employmentType VARCHAR(255),
    skills JSON,
    CompanyIndustry VARCHAR(255),
    workMode VARCHAR(255),
    jobLocation JSON,
    willingToRelocate Boolean,
    locality VARCHAR(255),
    experinceFrom VARCHAR(20),
    experinceTo VARCHAR(20),
    salaryRangeFrom VARCHAR(20),
    salaryRangeTo VARCHAR(20),
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
    
    Status ENUM('active', 'draft', 'disable') DEFAULT 'active',
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`);

    connection.release();
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

export { getPool };
export default { getPool, initializeDatabase };
