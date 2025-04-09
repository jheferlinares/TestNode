// Importa la conexión a la base de datos
const pool = require("../database"); // Asegúrate de que la ruta sea correcta

/* *****************************
 *   Register new account
 ***************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = `
      INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type)
      VALUES ($1, $2, $3, $4, 'Client') RETURNING *`;
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


async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}


async function updateAccountInfo(accountId, firstName, lastName, email) {
  const sql = 'UPDATE accounts SET first_name = $1, last_name = $2, email = $3 WHERE account_id = $4 RETURNING *';
  return db.query(sql, [firstName, lastName, email, accountId])
    .then(result => result.rows[0])
    .catch(err => {
      console.error('Error', err);
      throw new Error('');
    });
}

async function getAccountById(accountId) {
  const sql = 'SELECT * FROM accounts WHERE account_id = $1';
  return db.query(sql, [accountId])
    .then(result => result.rows[0])
    .catch(err => {
      console.error('Err', err);
      throw new Error('');
    });
}

function updatePassword(accountId, newPassword) {
  const hashedPassword = bcrypt.hashSync(newPassword, 10); // Cifrar la nueva contraseña
  const sql = 'UPDATE accounts SET password = $1 WHERE account_id = $2 RETURNING *';
  return db.query(sql, [hashedPassword, accountId])
    .then(result => result.rows[0])
    .catch(err => {
      console.error('Error', err);
      throw new Error('');
    });
}

module.exports = { registerAccount, checkExistingEmail, getAccountByEmail, getAccountById, updateAccountInfo, updatePassword};

