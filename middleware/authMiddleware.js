const jwt = require('jsonwebtoken');
const { pool } = require('../models/db');

function isAdminOrEmployee(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/login');
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.redirect('/login');
    }

    const { accountType } = decoded;
    if (accountType !== 'Admin' && accountType !== 'Employee') {
      req.flash('error', 'You do not have permission to access this page.');
      return res.redirect('/login');
    }

    req.user = decoded;
    next();
  });
}

module.exports = { isAdminOrEmployee };
