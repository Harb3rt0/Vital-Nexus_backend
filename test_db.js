const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const database = process.env.DB_NAME || 'vital_nexus';

  console.log(`Intentando conectar a la base de datos MySQL...`);
  console.log(`Host: ${host}`);
  console.log(`User: ${user}`);
  console.log(`Database: ${database}\n`);

  try {
    const connection = await mysql.createConnection({
      host,
      user,
      password: process.env.DB_PASSWORD || '',
      database
    });

    console.log('¡Conexión a la base de datos realizada con éxito!\n');

    // Consultar bases de datos disponibles
    const [databases] = await connection.query('SHOW DATABASES');
    console.log('Bases de datos disponibles:', databases.map(d => Object.values(d)[0]));

    // Consultar tablas y vistas en vital_nexus
    const [tables] = await connection.query(`SHOW FULL TABLES FROM \`${database}\``);
    console.log(`\nTablas y Vistas en la base de datos "${database}":`);
    console.table(tables.map(t => ({ Name: Object.values(t)[0], Type: Object.values(t)[1] })));

    // Consultar vistas globales
    const views = ['V_NODO', 'V_ADMINISTRADOR', 'V_ESTABLECIMIENTO', 'V_MEDICO', 'V_MEDICAMENTO', 'V_INVENTARIO_MEDICAMENTO', 'V_PACIENTE', 'V_EXPEDIENTE', 'V_RECETA'];
    console.log('\n--- Verificando Vistas Globales ---');
    for (const view of views) {
      try {
        const [res] = await connection.query(`SELECT COUNT(*) as count FROM \`${view}\``);
        console.log(`Vista ${view}: CORRECTA (Registros: ${res[0].count})`);
      } catch (e) {
        console.error(`Vista ${view}: FALLÓ - Error:`, e.message);
      }
    }

    // Consultar tablas base
    const baseTables = ['NODO', 'ADMINISTRADOR', 'ESTABLECIMIENTO', 'MEDICO', 'MEDICAMENTO', 'INVENTARIO_MEDICAMENTO', 'PACIENTE', 'EXPEDIENTE', 'RECETA'];
    console.log('\n--- Verificando Tablas Base ---');
    for (const table of baseTables) {
      try {
        const [res] = await connection.query(`SELECT COUNT(*) as count FROM \`${table}\``);
        console.log(`Tabla ${table}: CORRECTA (Registros: ${res[0].count})`);
      } catch (e) {
        console.error(`Tabla ${table}: FALLÓ - Error:`, e.message);
      }
    }

    await connection.end();
    console.log('\nVerificación de base de datos finalizada. Conexión cerrada.');
  } catch (error) {
    console.error('\n[ERROR] No se pudo conectar a la base de datos:', error.message);
    console.error('Por favor, revisa tus configuraciones en el archivo .env');
  }
}

main();
