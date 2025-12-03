
// src/config/db.js
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',      // Seu usuário do MySQL
  password: 'C418',      // Sua senha
  database: 'woodwork_DB',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


// Isso permite usar 'await' no controller
module.exports = pool.promise();