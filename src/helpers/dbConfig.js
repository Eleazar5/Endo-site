const mysql = require('mysql');

const { 
    DB_HOST,
    DB_USER,
    DB_PASS,
    DB_NAME
} = process.env;

// Create a MySQL connection pool
const pool = mysql.createPool({
    connectionLimit: 10,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME
});

const createMpesaTransactionsTable = `
CREATE TABLE IF NOT EXISTS tb_mpesa_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone_number VARCHAR(50) NOT NULL,
    account_no VARCHAR(200) NOT NULL,
    transaction VARCHAR(50) UNIQUE NOT NULL,
    amount INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

const createUsersTable = `
CREATE TABLE IF NOT EXISTS tb_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(200) NOT NULL,
    auth_otp VARCHAR(6) DEFAULT NULL,
    otp_createdat DATETIME DEFAULT NULL,
    firstname VARCHAR(200) DEFAULT NULL,
    lastname VARCHAR(200) DEFAULT NULL,
    password VARCHAR(200) DEFAULT NULL,
    phone_number VARCHAR(200) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT current_timestamp(),
    update_at DATETIME NOT NULL DEFAULT current_timestamp(),
    last_login DATETIME NOT NULL DEFAULT current_timestamp(),
    login_trials int(11) NOT NULL DEFAULT 0
  )
`;

const createPlayersTable = `
CREATE TABLE IF NOT EXISTS tb_players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tel VARCHAR(50) NOT NULL,
    position VARCHAR(200) NOT NULL,
    role VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

// Execute queries for table creation
pool.query(createMpesaTransactionsTable, (error, results) => {
  if (error) throw error;
  console.log('Mpesatransactions table created (if not exists)');
});

pool.query(createUsersTable, (error, results) => {
  if (error) throw error;
  console.log('Users table created (if not exists)');
});

pool.query(createPlayersTable, (error, results) => {
    if (error) throw error;
    console.log('Players table created (if not exists)');
});

module.exports = pool;