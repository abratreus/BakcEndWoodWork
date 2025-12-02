// // src/config/db.js
// const mysql = require('mysql2/promise');
// require('dotenv').config();

// const pool = mysql.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: process.env.DB_NAME,
//     waitForConnections: true,
//     connectionLimit: 10, // Ajuste conforme a carga esperada
//     queueLimit: 0
// });

// module.exports = pool.promise();

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