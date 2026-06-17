# VITAL~NEXUS: Sistema Nacional de Historial Clínico Unificado (Backend)

Este repositorio contiene la API REST para **VITAL~NEXUS**, una plataforma digital distribuida diseñada para integrar y unificar los expedientes clínicos de pacientes en México entre distintas instituciones de salud (públicas y privadas). 

El sistema implementa **Transparencia de Localización** mediante el uso de vistas unificadas globales para consultar fragmentos de bases de datos distribuidas en múltiples nodos regionales (Norte, Centro, Sur, etc.).

---

## Tecnologías Utilizadas

* **Runtime**: Node.js (v18+)
* **Framework**: Express.js (v5)
* **Base de Datos**: MySQL (utilizando la librería `mysql2` con soporte para promesas y pool de conexiones)
* **Motor de Búsqueda NoSQL**: Elasticsearch (utilizando la librería oficial `@elastic/elasticsearch` para persistencia en segundo plano)
* **Seguridad y Sesión**: JSON Web Tokens (JWT) firmados y cookies de sesión seguras (`httpOnly`, `sameSite: 'strict'`)
* **Variables de Entorno**: Dotenv
* **CORS**: Habilitado para comunicación cross-origin segura (`credentials: true`)

---

## Resiliencia de Infraestructura

Para garantizar que el sistema permanezca en funcionamiento en entornos locales o de desarrollo sin necesidad de levantar toda la infraestructura distribuida:
- **Resiliencia ante fallos de Elasticsearch**: El backend interactúa de manera no bloqueante con el motor NoSQL. Si la base de datos de Elasticsearch está inactiva o no se encuentra disponible, las operaciones principales (escritura en MySQL) continúan con éxito (HTTP 200/201), registrando solo una advertencia en la consola.
- **Resiliencia ante base de datos remota**: Se incluyen herramientas específicas para simular localmente las consultas SQL de base de datos distribuidas sin bloquear las pruebas lógicas.

---

## Configuración Segura (Entorno de Desarrollo)

Para evitar la fuga de credenciales en repositorios públicos, toda la configuración sensible se maneja a través de variables de entorno. El archivo `.env` está configurado en `.gitignore` para no ser subido al repositorio de Git.

### Paso 1: Configurar Variables de Entorno
Crea un archivo llamado `.env` en la raíz del proyecto (basado en la siguiente estructura):

```env
# Configuración del servidor
PORT=3000

# Credenciales de la base de datos distribuida (nodo local o remoto)
DB_HOST=localhost
DB_USER=mi_usuario_seguro
DB_PASSWORD=mi_contrasena_segura
DB_NAME=vital_nexus

# Configuración del buscador NoSQL
ELASTIC_URL=http://server2.vitalnexus.local:9200

# Configuración de Autenticación y Sesión de Administradores
JWT_SECRET=un_secreto_super_seguro_y_largo
JWT_EXPIRES_IN=2h
SESSION_LIFETIME=7200000
```

*Nota: Asegúrate de reemplazar las credenciales y URLs con los datos de tus servidores reales. Nunca compartas ni subas tu archivo `.env`.*

---

## Instalación y Uso

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Iniciar el servidor**:
   * En modo desarrollo/producción:
     ```bash
     npm start
     ```
     O bien:
     ```bash
     npm run dev
     ```

El servidor estará escuchando en el puerto definido en el `.env` (por defecto `http://localhost:3000`).

---

## Verificación y Pruebas

El repositorio contiene dos scripts automáticos de verificación en la raíz del proyecto:

1. **Pruebas de Integridad de la API (Mock)**:
   Valida el correcto funcionamiento de todas las peticiones (GET, POST, PUT, DELETE para las 9 entidades), las sentencias SQL generadas, y el flujo completo de inicio y cierre de sesión de los administradores con cookies y tokens JWT:
   ```bash
   node test_endpoints.js
   ```

2. **Pruebas de Conexión Real a Base de Datos**:
   Prueba la conexión real con el servidor MySQL externo utilizando las credenciales provistas en el archivo `.env`. Si tiene éxito, listará las tablas y verificará la presencia de las vistas globales de transparencia de localización:
   ```bash
   node test_db.js
   ```

---

## Estructura del Proyecto

```text
Vital-Nexus_backend/
├── src/
│   ├── config/          # Configuración de conexiones
│   │   ├── db.js            # Pool de MySQL
│   │   └── elasticsearch.js # Cliente de Elasticsearch
│   ├── controllers/     # Controladores de la API (Lógica y Consultas)
│   ├── middlewares/     # Middlewares (Autenticación y Seguridad)
│   │   └── authMiddleware.js
│   ├── routes/          # Enrutamiento de Express
│   └── index.js         # Servidor Express (Entrada de la aplicación)
├── .env                 # Variables de entorno (EXCLUIDO de git)
├── .gitignore           # Archivos ignorados por git (EXCLUIDO de git)
├── package.json
├── test_endpoints.js    # Suite de pruebas mock de endpoints
├── test_db.js           # Suite de diagnóstico de conexión de BD
└── README.md
```

---

## Conceptos de Base de Datos Distribuidas en la API

La API de Vital Nexus interactúa con la base de datos distribuida utilizando dos mecanismos principales para garantizar la transparencia de localización y la fragmentación:

1. **Lecturas (GET)**: Se realizan sobre **Vistas Globales** (`V_PACIENTE`, `V_EXPEDIENTE`, etc.). El motor de la base de datos se encarga de unificar de forma transparente la información que reside físicamente en distintos nodos o fragmentos lógicos mediante operaciones `UNION ALL`.
2. **Escrituras (POST/PUT/DELETE)**: Se realizan directamente en las tablas base. En el modelo distribuido final, la fragmentación se resuelve mediante triggers en el motor de base de datos o por asignación de nodos en la API.
