# VITAL~NEXUS: Sistema Nacional de Historial Clínico Unificado (Backend)

Este repositorio contiene la API REST para **VITAL~NEXUS**, una plataforma digital distribuida diseñada para integrar y unificar los expedientes clínicos de pacientes en México entre distintas instituciones de salud (públicas y privadas). 

El sistema implementa **Transparencia de Localización** mediante el uso de vistas unificadas globales para consultar fragmentos de bases de datos distribuidas en múltiples nodos regionales (Norte, Centro, Sur, etc.).

---

## Tecnologías Utilizadas

* **Runtime**: Node.js (v18+)
* **Framework**: Express.js (v5)
* **Base de Datos**: MySQL (utilizando la librería `mysql2` con soporte para promesas y pool de conexiones)
* **Variables de Entorno**: Dotenv
* **CORS**: Habilitado para comunicación cross-origin segura

---

## Configuración Segura (Entorno de Desarrollo)

Para evitar la fuga de credenciales en repositorios públicos, toda la configuración sensible se maneja a través de variables de entorno. El archivo `.env` está configurado en `.gitignore` para no ser subido al repositorio de Git.

### Paso 1: Configurar Variables de Entorno
Crea un archivo llamado `.env` en la raíz del proyecto (basado en la siguiente estructura):

```env
# Configuración del servidor
PORT=3000

# Credenciales de la base de datos distribuida (nodo local)
DB_HOST=localhost
DB_USER=mi_usuario_seguro
DB_PASSWORD=mi_contrasena_segura
DB_NAME=vital_nexus
```

*Nota: Asegúrate de reemplazar `mi_usuario_seguro` y `mi_contrasena_segura` con tus credenciales de MySQL reales. Nunca compartas ni subas tu archivo `.env`.*

---

## Instalación y Uso

1. **Clonar el repositorio**:
   ```bash
   git clone <url_del_repositorio>
   cd Vital_Nexus
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Iniciar el servidor**:
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

## Estructura del Proyecto

```text
Vital_Nexus/
├── src/
│   ├── config/          # Configuración de base de datos
│   │   └── db.js
│   ├── controllers/     # Controladores de la API (Lógica de Consultas)
│   ├── routes/          # Rutas de Express para cada módulo
│   └── index.js         # Punto de entrada de la aplicación
├── .env                 # Variables de entorno (EXCLUIDO de git)
├── .gitignore           # Archivos ignorados por git
├── package.json
└── README.md
```

---

## Conceptos de Base de Datos Distribuidas en la API

La API de Vital Nexus interactúa con la base de datos distribuida utilizando dos mecanismos principales para garantizar la transparencia de localización y la fragmentación:

1. **Lecturas (GET)**: Se realizan sobre **Vistas Globales** (`V_PACIENTE`, `V_EXPEDIENTE`, etc.). El motor de la base de datos se encarga de unificar de forma transparente la información que reside físicamente en distintos nodos o fragmentos lógicos mediante operaciones `UNION ALL`.
2. **Escrituras (POST)**: Se realizan directamente en las tablas base. En el modelo distribuido final, la fragmentación se resuelve mediante triggers en el motor de base de datos o por asignación de nodos en la API.
