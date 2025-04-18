// Importa la conexión a la base de datos
const pool = require("../database");
const bcrypt = require("bcryptjs");

/* *****************************
 *   Register new account
 ***************************** */
/* **********************
 *   Register new account
 * ********************* */
/* **********************
 *   Register new account
 * ********************* */
async function registerAccount(account_firstname, account_lastname, account_email, account_password, account_type) {
  try {
    const sql = 
      "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, $5::account_type) RETURNING *"
    return await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password,
      account_type
    ])
  } catch (error) {
    return error.message
  }
}



/* **********************
 *   Check for existing email
 ********************** */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const result = await pool.query(sql, [account_email]);
    return result.rows[0];
  } catch (error) {
    console.error("Error in checkExistingEmail:", error);
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
    // Validar que account_id sea un número válido
    if (!account_id || isNaN(account_id)) {
      throw new Error("Invalid account ID");
    }

    const sql = `
      SELECT account_id, account_firstname, account_lastname, 
             account_email, account_type 
      FROM account 
      WHERE account_id = $1`;
    
    // Convertir explícitamente a número entero
    const result = await pool.query(sql, [parseInt(account_id)]);
    
    // Verificar si se encontró el registro
    if (!result.rows[0]) {
      throw new Error("Account not found");
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error getting account by ID:", error);
    throw error;
  }
}


/* **********************
 *   Update account info
 ********************** */
/* **********************
 *   Update account info
 ********************** */
/* **********************
 *   Update Account
 * ********************* */
async function updateAccount(account_id, account_firstname, account_lastname, account_email) {
  try {
    const sql = `
      UPDATE account
      SET account_firstname = $1,
          account_lastname = $2,
          account_email = $3
      WHERE account_id = $4
      RETURNING *`;
    
    const data = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_id
    ]);

    return data.rows[0];
  } catch (error) {
    console.error("Error in updateAccount:", error);
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
  updateAccount,
  updatePassword
};


