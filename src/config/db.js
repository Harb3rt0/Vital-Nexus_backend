const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vital_nexus',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Comprobar la conexión inicial
pool.getConnection()
  .then(connection => {
    console.log('Conexión a la base de datos Vital Nexus exitosa.');
    connection.release();
  })
  .catch(err => {
    console.error('Error al conectar a la base de datos:', err.message);
  });

module.exports = pool;
