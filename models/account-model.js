// Importa la conexión a la base de datos
const pool = require("../database");
const bcrypt = require("bcryptjs");

/* *****************************
 *   Register new account
 ***************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = `
      INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type)
      VALUES ($1, $2, $3, $4, 'Client') 
      RETURNING *`;
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password]);
  } catch (error) {
    console.error("Error registering account:", error);
    throw error;
  }
}

/* **********************
 *   Check for existing email
 ********************** */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const email = await pool.query(sql, [account_email]);
    return email.rowCount;
  } catch (error) {
    console.error("Error checking existing email:", error);
    throw error;
  }
}

/* **********************
 *   Get account by email
 ********************** */
async function getAccountByEmail(account_email) {
  try {
    const sql = `
      SELECT account_id, account_firstname, account_lastname, 
             account_email, account_type, account_password 
      FROM account 
      WHERE account_email = $1`;
    const result = await pool.query(sql, [account_email]);
    return result.rows[0];
  } catch (error) {
    console.error("Error getting account by email:", error);
    throw new Error("No matching email found");
  }
}

/* **********************
 *   Get account by ID
 ********************** */
async function getAccountById(account_id) {
  try {
    const sql = `
      SELECT account_id, account_firstname, account_lastname, 
             account_email, account_type 
      FROM account 
      WHERE account_id = $1`;
    const result = await pool.query(sql, [account_id]);
    return result.rows[0];
  } catch (error) {
    console.error("Error getting account by ID:", error);
    throw error;
  }
}

/* **********************
 *   Update account info
 ********************** */
async function updateAccountInfo(account_id, account_firstname, account_lastname, account_email) {
  try {
    const sql = `
      UPDATE account 
      SET account_firstname = $1, 
          account_lastname = $2, 
          account_email = $3 
      WHERE account_id = $4 
      RETURNING *`;
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id]);
    return result.rows[0];
  } catch (error) {
    console.error("Error updating account:", error);
    throw error;
  }
}

/* **********************
 *   Update password
 ********************** */
async function updatePassword(account_id, account_password) {
  try {
    const hashedPassword = await bcrypt.hashSync(account_password, 10);
    const sql = `
      UPDATE account 
      SET account_password = $1 
      WHERE account_id = $2 
      RETURNING *`;
    const result = await pool.query(sql, [hashedPassword, account_id]);
    return result.rows[0];
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
}

module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  getAccountById,
  updateAccountInfo,
  updatePassword
};


