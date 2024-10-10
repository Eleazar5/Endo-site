const mysql = require('mysql2');

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

const createCustomersTable = `
CREATE TABLE IF NOT EXISTS tb_customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(200) NOT NULL,
    firstname VARCHAR(200) DEFAULT NULL,
    lastname VARCHAR(200) DEFAULT NULL,
    phone_number VARCHAR(200) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT current_timestamp(),
    update_at DATETIME NOT NULL DEFAULT current_timestamp()
  )
`;

const createVendorsTable = `
CREATE TABLE IF NOT EXISTS tb_vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(200) NOT NULL,
    firstname VARCHAR(200) DEFAULT NULL,
    lastname VARCHAR(200) DEFAULT NULL,
    phone_number VARCHAR(200) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT current_timestamp(),
    update_at DATETIME NOT NULL DEFAULT current_timestamp()
  )
`;

const createSalesTable = `
CREATE TABLE IF NOT EXISTS tb_sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customername VARCHAR(200) DEFAULT NULL,
    phone_number VARCHAR(200) DEFAULT NULL,
    item_name VARCHAR(200) DEFAULT NULL,
    quantity VARCHAR(200) DEFAULT NULL,
    sale_amount int(11) NOT NULL DEFAULT 0,
    payment_mode VARCHAR(200) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT current_timestamp(),
    update_at DATETIME NOT NULL DEFAULT current_timestamp()
  )
`;

const createProductsTable = `
CREATE TABLE IF NOT EXISTS tb_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    productname VARCHAR(200) DEFAULT NULL,
    unit_price int(11) NOT NULL DEFAULT 0,
    total_quantity VARCHAR(200) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT current_timestamp(),
    update_at DATETIME NOT NULL DEFAULT current_timestamp()
  )
`;
// Execute queries for table creation
pool.query(createMpesaTransactionsTable, (error, results) => {
  if (error) throw error;
  return;
});

pool.query(createUsersTable, (error, results) => {
  if (error) throw error;
  return;
});

pool.query(createPlayersTable, (error, results) => {
    if (error) throw error;
    return;
});

pool.query(createCustomersTable, (error, results) => {
  if (error) throw error;
  return;
});

pool.query(createVendorsTable, (error, results) => {
  if (error) throw error;
  return;
});

pool.query(createSalesTable, (error, results) => {
  if (error) throw error;
  return;
});

pool.query(createProductsTable, (error, results) => {
  if (error) throw error;
  return;
});

module.exports = pool;