const express = require('express');
const http = require('http');

// Intercept queries
const interceptedQueries = [];
const esInterceptions = [];

function mockDataForQuery(sql, params) {
  const normalizedSql = sql.trim().toUpperCase();
  if (normalizedSql.startsWith('INSERT')) {
    return { affectedRows: 1 };
  }
  if (normalizedSql.startsWith('UPDATE')) {
    return { affectedRows: 1 };
  }
  if (normalizedSql.startsWith('DELETE')) {
    return { affectedRows: 1 };
  }
  // Return dummy data matching different requests
  return [
    {
      id_paciente: '1d604da9-9a81-4ba9-80c2-de3375d59b40',
      nombre: 'José Eduardo181',
      apellido: 'Gómez206',
      curp_ssn: '999-76-6866',
      fecha_nac: '1989-05-25',
      genero: 'M',
      ciudad_residencia: 'Chicopee',
      id_nodo_orig: 1,
      id_admin: 1,
      username: 'Angel',
      password_hash: 'eae7b48bddde36fdfe4c816f1597b017dc7b4203e50df6f0ff31c27d29befc7f', // SHA-256 for 'hash_seguro_123'
      email: 'angel.admin@vitalnexus.com',
      id_nodo_asig: 1,
      id_establecimiento: 'ef58ea08-d883-3957-8300-150554edc8fb',
      nombre: 'HEALTHALLIANCE HOSPITALS INC',
      direccion: '60 HOSPITAL ROAD',
      ciudad: 'LEOMINSTER',
      codigo_postal: '01453',
      id_medico: '3421aa75-dec7-378d-a9e0-0bc764e4cb0d',
      nombre_completo: 'Tomas436 Sauer652',
      especialidad: 'GENERAL PRACTICE',
      codigo_medicamento: '389221',
      nombre_generico: 'Etonogestrel 68 MG Drug Implant',
      costo_base: 677.08,
      requiere_receta: 1,
      id_inventario: 1,
      stock_actual: 50,
      id_expediente: 'd0c40d10-8d87-447e-836e-99d26ad52ea5',
      fecha_atencion: '2010-01-23 17:45:28',
      motivo_consulta: 'Acute bronchitis (disorder)',
      id_receta: 'REC-001',
      instrucciones: 'Tomar 1 tableta cada 24 horas por 7 días',
      estado_surtido: 'PENDIENTE',
      fecha_prescripcion: '2026-04-17 10:00:00',
      id_nodo: 1,
      nombre_region: 'Norte',
      ip_servidor: '192.168.1.10',
      ubicacion_geografica: 'Aguascalientes'
    }
  ];
}

// Mock mysql2/promise
const mockPool = {
  getConnection: async () => {
    return {
      release: () => {}
    };
  },
  query: async (sql, params) => {
    interceptedQueries.push({ sql, params });
    const data = mockDataForQuery(sql, params);
    return [data, []];
  }
};

const mockMysql = {
  createPool: () => mockPool,
  createConnection: () => ({
    query: async (sql, params) => {
      interceptedQueries.push({ sql, params });
      return [mockDataForQuery(sql, params), []];
    },
    end: async () => {}
  })
};

// Set require cache before loading db module
require.cache[require.resolve('mysql2/promise')] = {
  id: require.resolve('mysql2/promise'),
  filename: require.resolve('mysql2/promise'),
  loaded: true,
  exports: mockMysql
};

// Mock @elastic/elasticsearch Client
class MockElasticClient {
  constructor(options) {
    this.options = options;
  }
  async ping() {
    esInterceptions.push({ op: 'ping' });
    return true;
  }
  async index(params) {
    esInterceptions.push({ op: 'index', params });
    return { result: 'created' };
  }
  async update(params) {
    esInterceptions.push({ op: 'update', params });
    return { result: 'updated' };
  }
  async delete(params) {
    esInterceptions.push({ op: 'delete', params });
    return { result: 'deleted' };
  }
}

const mockElastic = {
  Client: MockElasticClient
};

require.cache[require.resolve('@elastic/elasticsearch')] = {
  id: require.resolve('@elastic/elasticsearch'),
  filename: require.resolve('@elastic/elasticsearch'),
  loaded: true,
  exports: mockElastic
};

// Intercept express listen to shut down server cleanly
const originalListen = express.application.listen;
let serverInstance;
express.application.listen = function(...args) {
  serverInstance = originalListen.apply(this, args);
  return serverInstance;
};

// Start the app by requiring index.js
process.env.PORT = 3001; // use separate port
require('./src/index.js');

// Test framework
async function runTests() {
  console.log('\n==================================================');
  console.log('  INICIANDO PRUEBAS DE VERIFICACIÓN ENDPOINTS MOCK');
  console.log('==================================================\n');

  const testCases = [
    // 1. PACIENTES
    {
      name: 'GET /api/pacientes (Listar pacientes)',
      method: 'GET',
      path: '/api/pacientes',
      expectedStatus: 200,
      expectedSql: 'SELECT * FROM V_PACIENTE'
    },
    {
      name: 'GET /api/pacientes/:id (Obtener paciente por ID)',
      method: 'GET',
      path: '/api/pacientes/1d604da9-9a81-4ba9-80c2-de3375d59b40',
      expectedStatus: 200,
      expectedSql: 'SELECT * FROM V_PACIENTE WHERE id_paciente = ?',
      expectedParams: ['1d604da9-9a81-4ba9-80c2-de3375d59b40']
    },
    {
      name: 'POST /api/pacientes (Registrar paciente)',
      method: 'POST',
      path: '/api/pacientes',
      body: {
        id_paciente: '1d604da9-9a81-4ba9-80c2-de3375d59b40',
        curp_ssn: '999-76-6866',
        nombre: 'José Eduardo181',
        apellido: 'Gómez206',
        fecha_nac: '1989-05-25',
        genero: 'M',
        ciudad_residencia: 'Chicopee',
        id_nodo_orig: 1
      },
      expectedStatus: 201,
      expectedSql: 'INSERT INTO PACIENTE',
      expectedEsOp: 'index'
    },
    {
      name: 'PUT /api/pacientes/:id (Actualizar paciente)',
      method: 'PUT',
      path: '/api/pacientes/1d604da9-9a81-4ba9-80c2-de3375d59b40',
      body: {
        nombre: 'José Eduardo Editado',
        apellido: 'Gómez206',
        ciudad_residencia: 'New York'
      },
      expectedStatus: 200,
      expectedSql: 'UPDATE PACIENTE',
      expectedEsOp: 'update'
    },
    {
      name: 'DELETE /api/pacientes/:id (Eliminar paciente)',
      method: 'DELETE',
      path: '/api/pacientes/1d604da9-9a81-4ba9-80c2-de3375d59b40',
      expectedStatus: 200,
      expectedSql: 'DELETE FROM PACIENTE',
      expectedEsOp: 'delete'
    },

    // 2. EXPEDIENTES
    {
      name: 'GET /api/expedientes (Listar expedientes)',
      method: 'GET',
      path: '/api/expedientes',
      expectedStatus: 200,
      expectedSql: 'SELECT * FROM V_EXPEDIENTE'
    },
    {
      name: 'GET /api/expedientes/paciente/:id_paciente (Obtener expediente por ID de paciente)',
      method: 'GET',
      path: '/api/expedientes/paciente/1d604da9-9a81-4ba9-80c2-de3375d59b40',
      expectedStatus: 200,
      expectedSql: 'SELECT * FROM V_EXPEDIENTE WHERE id_paciente = ? ORDER BY fecha_atencion DESC',
      expectedParams: ['1d604da9-9a81-4ba9-80c2-de3375d59b40']
    },
    {
      name: 'POST /api/expedientes (Registrar consulta en expediente)',
      method: 'POST',
      path: '/api/expedientes',
      body: {
        id_expediente: 'd0c40d10-8d87-447e-836e-99d26ad52ea5',
        id_paciente: '1d604da9-9a81-4ba9-80c2-de3375d59b40',
        id_medico: '3421aa75-dec7-378d-a9e0-0bc764e4cb0d',
        id_establecimiento: 'ef58ea08-d883-3957-8300-150554edc8fb',
        fecha_atencion: '2010-01-23 17:45:28',
        motivo_consulta: 'Acute bronchitis (disorder)'
      },
      expectedStatus: 201,
      expectedSql: 'INSERT INTO EXPEDIENTE',
      expectedEsOp: 'index'
    },

    // 3. ADMINISTRADORES
    {
      name: 'POST /api/administradores (Registrar administrador)',
      method: 'POST',
      path: '/api/administradores',
      body: {
        id_admin: 1,
        username: 'Angel',
        password_hash: 'hash_seguro_123',
        email: 'angel.admin@vitalnexus.com',
        id_nodo_asig: 1
      },
      expectedStatus: 201,
      expectedSql: 'INSERT INTO ADMINISTRADOR',
      expectedEsOp: 'index'
    },
    {
      name: 'POST /api/administradores/login (Credenciales inválidas)',
      method: 'POST',
      path: '/api/administradores/login',
      body: {
        username: 'Angel',
        password: 'wrong_password'
      },
      expectedStatus: 401,
      expectedSql: 'SELECT * FROM V_ADMINISTRADOR WHERE username = ?',
      expectedParams: ['Angel']
    },
    {
      name: 'POST /api/administradores/login (Credenciales válidas)',
      method: 'POST',
      path: '/api/administradores/login',
      body: {
        username: 'Angel',
        password: 'hash_seguro_123'
      },
      expectedStatus: 200,
      expectedSql: 'SELECT * FROM V_ADMINISTRADOR WHERE username = ?',
      expectedParams: ['Angel'],
      saveCookie: true
    },
    {
      name: 'GET /api/administradores/me (Con autenticación)',
      method: 'GET',
      path: '/api/administradores/me',
      expectedStatus: 200,
      useCookie: true,
      skipSqlCheck: true
    },
    {
      name: 'GET /api/administradores (Con autenticación)',
      method: 'GET',
      path: '/api/administradores',
      expectedStatus: 200,
      expectedSql: 'SELECT * FROM V_ADMINISTRADOR',
      useCookie: true
    },
    {
      name: 'GET /api/administradores/:id (Con autenticación)',
      method: 'GET',
      path: '/api/administradores/1',
      expectedStatus: 200,
      expectedSql: 'SELECT * FROM V_ADMINISTRADOR WHERE id_admin = ?',
      expectedParams: ['1'],
      useCookie: true
    },
    {
      name: 'GET /api/administradores (Sin autenticación - Debe ser rechazado)',
      method: 'GET',
      path: '/api/administradores',
      expectedStatus: 401,
      skipSqlCheck: true
    },
    {
      name: 'POST /api/administradores/logout (Cerrar sesión)',
      method: 'POST',
      path: '/api/administradores/logout',
      expectedStatus: 200,
      useCookie: true,
      skipSqlCheck: true,
      clearCookie: true
    },
    {
      name: 'GET /api/administradores/me (Después de logout - Debe ser rechazado)',
      method: 'GET',
      path: '/api/administradores/me',
      expectedStatus: 401,
      skipSqlCheck: true
    },

    // 4. ESTABLECIMIENTOS
    {
      name: 'GET /api/establecimientos (Listar establecimientos)',
      method: 'GET',
      path: '/api/establecimientos',
      expectedStatus: 200,
      expectedSql: 'SELECT * FROM V_ESTABLECIMIENTO'
    },
    {
      name: 'GET /api/establecimientos/:id (Obtener establecimiento por ID)',
      method: 'GET',
      path: '/api/establecimientos/ef58ea08-d883-3957-8300-150554edc8fb',
      expectedStatus: 200,
      expectedSql: 'SELECT * FROM V_ESTABLECIMIENTO WHERE id_establecimiento = ?',
      expectedParams: ['ef58ea08-d883-3957-8300-150554edc8fb']
    },
    {
      name: 'POST /api/establecimientos (Registrar establecimiento)',
      method: 'POST',
      path: '/api/establecimientos',
      body: {
        id_establecimiento: 'ef58ea08-d883-3957-8300-150554edc8fb',
        nombre: 'HEALTHALLIANCE HOSPITALS INC',
        direccion: '60 HOSPITAL ROAD',
        ciudad: 'LEOMINSTER',
        codigo_postal: '01453',
        id_nodo_asig: 1
      },
      expectedStatus: 201,
      expectedSql: 'INSERT INTO ESTABLECIMIENTO',
      expectedEsOp: 'index'
    },

    // 5. INVENTARIOS
    {
      name: 'GET /api/inventarios (Listar inventarios)',
      method: 'GET',
      path: '/api/inventarios',
      expectedStatus: 200,
      expectedSql: 'SELECT * FROM V_INVENTARIO_MEDICAMENTO'
    },
    {
      name: 'GET /api/inventarios/:id (Obtener inventario por ID)',
      method: 'GET',
      path: '/api/inventarios/1',
      expectedStatus: 200,
      expectedSql: 'SELECT * FROM V_INVENTARIO_MEDICAMENTO WHERE id_inventario = ?',
      expectedParams: ['1']
    },
    {
      name: 'POST /api/inventarios (Registrar inventario)',
      method: 'POST',
      path: '/api/inventarios',
      body: {
        id_inventario: 1,
        id_establecimiento: 'ef58ea08-d883-3957-8300-150554edc8fb',
        codigo_medicamento: '389221',
        stock_actual: 50
      },
      expectedStatus: 201,
      expectedSql: 'INSERT INTO INVENTARIO_MEDICAMENTO',
      expectedEsOp: 'index'
    },

    // 6. MEDICAMENTOS
    {
      name: 'GET /api/medicamentos (Listar medicamentos)',
      method: 'GET',
      path: '/api/medicamentos',
      expectedStatus: 200,
      expectedSql: 'SELECT * FROM V_MEDICAMENTO'
    },
    {
      name: 'GET /api/medicamentos/:id (Obtener medicamento por código)',
      method: 'GET',
      path: '/api/medicamentos/389221',
      expectedStatus: 200,
      expectedSql: 'SELECT * FROM V_MEDICAMENTO WHERE codigo_medicamento = ?',
      expectedParams: ['389221']
    },
    {
      name: 'POST /api/medicamentos (Registrar medicamento)',
      method: 'POST',
      path: '/api/medicamentos',
      body: {
        codigo_medicamento: '389221',
        nombre_generico: 'Etonogestrel 68 MG Drug Implant',
        costo_base: 677.08,
        requiere_receta: true
      },
      expectedStatus: 201,
      expectedSql: 'INSERT INTO MEDICAMENTO',
      expectedEsOp: 'index'
    },

    // 7. MEDICOS
    {
      name: 'GET /api/medicos (Listar médicos)',
      method: 'GET',
      path: '/api/medicos',
      expectedStatus: 200,
      expectedSql: 'SELECT * FROM V_MEDICO'
    },
    {
      name: 'GET /api/medicos/:id (Obtener médico por ID)',
      method: 'GET',
      path: '/api/medicos/3421aa75-dec7-378d-a9e0-0bc764e4cb0d',
      expectedStatus: 200,
      expectedSql: 'SELECT * FROM V_MEDICO WHERE id_medico = ?',
      expectedParams: ['3421aa75-dec7-378d-a9e0-0bc764e4cb0d']
    },
    {
      name: 'POST /api/medicos (Registrar médico)',
      method: 'POST',
      path: '/api/medicos',
      body: {
        id_medico: '3421aa75-dec7-378d-a9e0-0bc764e4cb0d',
        id_establecimiento: 'ef58ea08-d883-3957-8300-150554edc8fb',
        nombre_completo: 'Tomas436 Sauer652',
        especialidad: 'GENERAL PRACTICE',
        genero: 'M'
      },
      expectedStatus: 201,
      expectedSql: 'INSERT INTO MEDICO',
      expectedEsOp: 'index'
    },

    // 8. NODOS
    {
      name: 'GET /api/nodos (Listar nodos)',
      method: 'GET',
      path: '/api/nodos',
      expectedStatus: 200,
      expectedSql: 'SELECT * FROM V_NODO'
    },
    {
      name: 'GET /api/nodos/:id (Obtener nodo por ID)',
      method: 'GET',
      path: '/api/nodos/1',
      expectedStatus: 200,
      expectedSql: 'SELECT * FROM V_NODO WHERE id_nodo = ?',
      expectedParams: ['1']
    },
    {
      name: 'POST /api/nodos (Registrar nodo)',
      method: 'POST',
      path: '/api/nodos',
      body: {
        id_nodo: 1,
        nombre_region: 'Norte',
        ip_servidor: '192.168.1.10',
        ubicacion_geografica: 'Aguascalientes'
      },
      expectedStatus: 201,
      expectedSql: 'INSERT INTO NODO',
      expectedEsOp: 'index'
    },

    // 9. RECETAS
    {
      name: 'GET /api/recetas (Listar recetas)',
      method: 'GET',
      path: '/api/recetas',
      expectedStatus: 200,
      expectedSql: 'SELECT * FROM V_RECETA'
    },
    {
      name: 'GET /api/recetas/:id (Obtener receta por ID)',
      method: 'GET',
      path: '/api/recetas/REC-001',
      expectedStatus: 200,
      expectedSql: 'SELECT * FROM V_RECETA WHERE id_receta = ?',
      expectedParams: ['REC-001']
    },
    {
      name: 'POST /api/recetas (Registrar receta)',
      method: 'POST',
      path: '/api/recetas',
      body: {
        id_receta: 'REC-001',
        id_expediente: 'd0c40d10-8d87-447e-836e-99d26ad52ea5',
        codigo_medicamento: '389221',
        instrucciones: 'Tomar 1 tableta cada 24 horas por 7 días',
        estado_surtido: 'PENDIENTE',
        fecha_prescripcion: '2026-04-17 10:00:00'
      },
      expectedStatus: 201,
      expectedSql: 'INSERT INTO RECETA',
      expectedEsOp: 'index'
    }
  ];

  let passedTests = 0;
  let failedTests = 0;
  const results = [];
  let sessionCookie = '';

  // Wait for server to be ready
  await new Promise(resolve => setTimeout(resolve, 1000));

  for (const tc of testCases) {
    interceptedQueries.length = 0; // Clear queries
    esInterceptions.length = 0;   // Clear Elasticsearch ops
    let testPassed = true;
    let failReason = '';
    let responseData;
    let actualStatus;

    try {
      const url = `http://localhost:3001${tc.path}`;
      const options = {
        method: tc.method,
        headers: { 'Content-Type': 'application/json' }
      };
      if (tc.body) {
        options.body = JSON.stringify(tc.body);
      }
      
      // Inject session cookie if required
      if (tc.useCookie && sessionCookie) {
        options.headers['Cookie'] = sessionCookie;
      }

      const res = await fetch(url, options);
      actualStatus = res.status;
      responseData = await res.json();

      // Save session cookie if required
      if (tc.saveCookie) {
        const setCookieHeader = res.headers.get('set-cookie');
        if (setCookieHeader) {
          sessionCookie = setCookieHeader;
        } else {
          testPassed = false;
          failReason += `Expected Set-Cookie but none was found. `;
        }
      }

      // Clear session cookie if required
      if (tc.clearCookie) {
        sessionCookie = '';
      }

      // Check status code
      if (actualStatus !== tc.expectedStatus) {
        testPassed = false;
        failReason += `Status mismatch (Expected: ${tc.expectedStatus}, Got: ${actualStatus}). Response: ${JSON.stringify(responseData)}. `;
      }

      // Check query interception
      if (!tc.skipSqlCheck) {
        if (interceptedQueries.length === 0) {
          testPassed = false;
          failReason += `No SQL query was executed on database. `;
        } else {
          const lastQuery = interceptedQueries[interceptedQueries.length - 1];
          const lastSqlClean = lastQuery.sql.replace(/\s+/g, ' ').replace(/\s*=\s*/g, '=').trim().toUpperCase();
          const expectedSqlClean = tc.expectedSql.replace(/\s+/g, ' ').replace(/\s*=\s*/g, '=').trim().toUpperCase();

          if (!lastSqlClean.includes(expectedSqlClean)) {
            testPassed = false;
            failReason += `SQL Query mismatch.\nExpected to include: "${expectedSqlClean}"\nGot: "${lastQuery.sql}". `;
          }

          // Check query params if specified
          if (tc.expectedParams) {
            const actualParams = lastQuery.params;
            for (let i = 0; i < tc.expectedParams.length; i++) {
              if (String(actualParams[i]) !== String(tc.expectedParams[i])) {
                testPassed = false;
                failReason += `SQL Params mismatch at index ${i} (Expected: "${tc.expectedParams[i]}", Got: "${actualParams[i]}"). `;
              }
            }
          }
        }
      }

      // Check Elasticsearch interception if expected
      if (tc.expectedEsOp) {
        const hasEsOp = esInterceptions.some(op => op.op === tc.expectedEsOp);
        if (!hasEsOp) {
          testPassed = false;
          failReason += `Expected Elasticsearch operation "${tc.expectedEsOp}" was not intercepted. `;
        }
      }
    } catch (e) {
      testPassed = false;
      failReason += `Execution error: ${e.message}. `;
    }

    if (testPassed) {
      passedTests++;
      results.push({ name: tc.name, status: 'PASSED', error: '' });
      console.log(`[PASS] ${tc.name}`);
    } else {
      failedTests++;
      results.push({ name: tc.name, status: 'FAILED', error: failReason });
      console.log(`[FAIL] ${tc.name}`);
      console.log(`       Motivo: ${failReason}`);
      if (interceptedQueries.length > 0) {
        console.log(`       Última Consulta SQL:`, interceptedQueries[interceptedQueries.length - 1]);
      }
      if (esInterceptions.length > 0) {
        console.log(`       Últimas Operaciones ES:`, esInterceptions);
      }
    }
  }

  console.log('\n==================================================');
  console.log('               RESUMEN DE PRUEBAS');
  console.log('==================================================');
  console.log(`Total Pruebas: ${testCases.length}`);
  console.log(`Aprobadas:     ${passedTests}`);
  console.log(`Fallidas:      ${failedTests}`);
  console.log('==================================================\n');

  if (serverInstance) {
    console.log('Cerrando el servidor de prueba...');
    serverInstance.close(() => {
      console.log('Servidor de prueba cerrado.');
      process.exit(failedTests > 0 ? 1 : 0);
    });
  } else {
    process.exit(failedTests > 0 ? 1 : 0);
  }
}

runTests().catch(err => {
  console.error('Error durante la ejecución de pruebas:', err);
  process.exit(1);
});
