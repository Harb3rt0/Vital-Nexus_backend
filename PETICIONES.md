# Guía de Peticiones y Consultas a la API de Vital Nexus

Esta guía detalla todos los endpoints disponibles en la API REST de **Vital Nexus**, indicando los métodos HTTP, la estructura de las peticiones (`body`) y las consultas internas a base de datos que se disparan.

---

## Configuración Base

* **URL Base de la API**: `http://localhost:3000/api`
* **Cabecera Requerida**: `Content-Type: application/json`

---

## 1. Pacientes (`/api/pacientes`)

### Listar Pacientes
* **Método**: `GET`
* **URL**: `/api/pacientes`
* **Consulta Interna**: `SELECT * FROM V_PACIENTE` (Transparencia de localización a través de la vista de fragmentación horizontal).
* **Respuesta Esperada (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id_paciente": "1d604da9-9a81-4ba9-80c2-de3375d59b40",
        "curp_ssn": "999-76-6866",
        "nombre": "José Eduardo181",
        "apellido": "Gómez206",
        "fecha_nac": "1989-05-25",
        "genero": "M",
        "ciudad_residencia": "Chicopee",
        "id_nodo_orig": 1
      }
    ]
  }
  ```

### Obtener Paciente por ID
* **Método**: `GET`
* **URL**: `/api/pacientes/:id` (Ej: `/api/pacientes/1d604da9-9a81-4ba9-80c2-de3375d59b40`)
* **Consulta Interna**: `SELECT * FROM V_PACIENTE WHERE id_paciente = ?`
* **Respuesta Esperada (200 OK)**: JSON del objeto del paciente en la propiedad `data`.

### Registrar Paciente
* **Método**: `POST`
* **URL**: `/api/pacientes`
* **Cuerpo de la Petición (JSON)**:
  ```json
  {
    "id_paciente": "1d604da9-9a81-4ba9-80c2-de3375d59b40",
    "curp_ssn": "999-76-6866",
    "nombre": "José Eduardo181",
    "apellido": "Gómez206",
    "fecha_nac": "1989-05-25",
    "genero": "M",
    "ciudad_residencia": "Chicopee",
    "id_nodo_orig": 1
  }
  ```
* **Consulta Interna**: `INSERT INTO PACIENTE (...) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
* **Respuesta Esperada (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Paciente registrado exitosamente.",
    "data": {
      "id_paciente": "1d604da9-9a81-4ba9-80c2-de3375d59b40",
      "nombre": "José Eduardo181",
      "apellido": "Gómez206"
    }
  }
  ```

---

## 2. Expedientes y Consultas (`/api/expedientes`)

### Listar Expedientes (General)
* **Método**: `GET`
* **URL**: `/api/expedientes`
* **Consulta Interna**: `SELECT * FROM V_EXPEDIENTE`

### Obtener Expedientes por ID de Paciente (Historial Clínico)
* **Método**: `GET`
* **URL**: `/api/expedientes/paciente/:id_paciente` (Ej: `/api/expedientes/paciente/1d604da9-9a81-4ba9-80c2-de3375d59b40`)
* **Consulta Interna**: `SELECT * FROM V_EXPEDIENTE WHERE id_paciente = ? ORDER BY fecha_atencion DESC`
* **Respuesta Esperada (200 OK)**: Retorna un listado de todas las consultas realizadas al paciente en orden cronológico inverso.

### Registrar Consulta en Expediente
* **Método**: `POST`
* **URL**: `/api/expedientes`
* **Cuerpo de la Petición (JSON)**:
  ```json
  {
    "id_expediente": "d0c40d10-8d87-447e-836e-99d26ad52ea5",
    "id_paciente": "1d604da9-9a81-4ba9-80c2-de3375d59b40",
    "id_medico": "3421aa75-dec7-378d-a9e0-0bc764e4cb0d",
    "id_establecimiento": "ef58ea08-d883-3957-8300-150554edc8fb",
    "fecha_atencion": "2010-01-23 17:45:28",
    "motivo_consulta": "Acute bronchitis (disorder)"
  }
  ```
* **Consulta Interna**: `INSERT INTO EXPEDIENTE (...) VALUES (?, ?, ?, ?, ?, ?)`

---

## 3. Administradores (`/api/administradores`)

### Registro de Administrador (Público)
* **Método**: `POST`
* **URL**: `/api/administradores`
* **Descripción**: Registra un nuevo administrador. La contraseña provista en `password_hash` será cifrada automáticamente a un hash SHA-256 en el servidor.
* **Cuerpo de la Petición (JSON)**:
  ```json
  {
    "id_admin": 1,
    "username": "Angel",
    "password_hash": "hash_seguro_123",
    "email": "angel.admin@vitalnexus.com",
    "id_nodo_asig": 1
  }
  ```

### Inicio de Sesión / Login (Público)
* **Método**: `POST`
* **URL**: `/api/administradores/login`
* **Descripción**: Valida el usuario y contraseña del administrador. En caso de éxito, genera un token JWT y lo almacena en una cookie HttpOnly y SameSite llamada `admin_token`.
* **Cuerpo de la Petición (JSON)**:
  ```json
  {
    "username": "Angel",
    "password": "hash_seguro_123"
  }
  ```
* **Respuesta Esperada (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Inicio de sesión exitoso.",
    "data": {
      "id_admin": 1,
      "username": "Angel",
      "email": "angel.admin@vitalnexus.com",
      "id_nodo_asig": 1
    }
  }
  ```

### Obtener Perfil de Administrador Autenticado (Protegida)
* **Método**: `GET`
* **URL**: `/api/administradores/me`
* **Descripción**: Retorna los datos básicos del administrador que inició sesión. Requiere que la cookie `admin_token` esté presente y sea válida.
* **Respuesta Esperada (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id_admin": 1,
      "username": "Angel",
      "email": "angel.admin@vitalnexus.com",
      "id_nodo_asig": 1,
      "iat": 1781525000,
      "exp": 1781532200
    }
  }
  ```

### Listar Administradores (Protegida)
* **Método**: `GET`
* **URL**: `/api/administradores`
* **Descripción**: Lista todos los administradores en el sistema. Requiere autenticación.
* **Consulta Interna**: `SELECT * FROM V_ADMINISTRADOR` (Transparencia de localización).

### Obtener Administrador por ID (Protegida)
* **Método**: `GET`
* **URL**: `/api/administradores/:id`
* **Descripción**: Obtiene los datos detallados de un administrador por su ID. Requiere autenticación.
* **Consulta Interna**: `SELECT * FROM V_ADMINISTRADOR WHERE id_admin = ?`

### Cerrar Sesión / Logout (Público)
* **Método**: `POST`
* **URL**: `/api/administradores/logout`
* **Descripción**: Borra la cookie de sesión `admin_token`.
* **Respuesta Esperada (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Sesión cerrada exitosamente."
  }
  ```

---

## 4. Establecimientos de Salud (`/api/establecimientos`)

* **GET `/`**: Consulta a `V_ESTABLECIMIENTO` para listar centros de salud y hospitales.
* **GET `/:id`**: Consulta `V_ESTABLECIMIENTO WHERE id_establecimiento = ?`
* **POST `/`**: Inserta un establecimiento en `ESTABLECIMIENTO`.
  * **Cuerpo de la Petición (JSON)**:
    ```json
    {
      "id_establecimiento": "ef58ea08-d883-3957-8300-150554edc8fb",
      "nombre": "HEALTHALLIANCE HOSPITALS INC",
      "direccion": "60 HOSPITAL ROAD",
      "ciudad": "LEOMINSTER",
      "codigo_postal": "01453",
      "id_nodo_asig": 1
    }
    ```

---

## 5. Inventario de Medicamentos (`/api/inventarios`)

* **GET `/`**: Consulta a `V_INVENTARIO_MEDICAMENTO` para auditar stock nacional.
* **GET `/:id`**: Consulta `V_INVENTARIO_MEDICAMENTO WHERE id_inventario = ?`
* **POST `/`**: Inserta registro de stock en `INVENTARIO_MEDICAMENTO`.
  * **Cuerpo de la Petición (JSON)**:
    ```json
    {
      "id_inventario": 1,
      "id_establecimiento": "ef58ea08-d883-3957-8300-150554edc8fb",
      "codigo_medicamento": "389221",
      "stock_actual": 50
    }
    ```

---

## 6. Catálogo de Medicamentos (`/api/medicamentos`)

* **GET `/`**: Consulta a `V_MEDICAMENTO` (Catálogo maestro unificado).
* **GET `/:id`**: Consulta `V_MEDICAMENTO WHERE codigo_medicamento = ?`
* **POST `/`**: Registra medicamento en `MEDICAMENTO`.
  * **Cuerpo de la Petición (JSON)**:
    ```json
    {
      "codigo_medicamento": "389221",
      "nombre_generico": "Etonogestrel 68 MG Drug Implant",
      "costo_base": 677.08,
      "requiere_receta": true
    }
    ```

---

## 7. Directorio Médico (`/api/medicos`)

* **GET `/`**: Consulta a `V_MEDICO` para listar médicos.
* **GET `/:id`**: Consulta `V_MEDICO WHERE id_medico = ?`
* **POST `/`**: Registra un médico en `MEDICO`.
  * **Cuerpo de la Petición (JSON)**:
    ```json
    {
      "id_medico": "3421aa75-dec7-378d-a9e0-0bc764e4cb0d",
      "id_establecimiento": "ef58ea08-d883-3957-8300-150554edc8fb",
      "nombre_completo": "Tomas436 Sauer652",
      "especialidad": "GENERAL PRACTICE",
      "genero": "M"
    }
    ```

---

## 8. Nodos de Infraestructura (`/api/nodos`)

* **GET `/`**: Consulta a `V_NODO` para auditar la red.
* **GET `/:id`**: Consulta `V_NODO WHERE id_nodo = ?`
* **POST `/`**: Registra nodo en `NODO`.
  * **Cuerpo de la Petición (JSON)**:
    ```json
    {
      "id_nodo": 1,
      "nombre_region": "Norte",
      "ip_servidor": "192.168.1.10",
      "ubicacion_geografica": "Aguascalientes"
    }
    ```

---

## 9. Recetas Prescritas (`/api/recetas`)

* **GET `/`**: Consulta a `V_RECETA`.
* **GET `/:id`**: Consulta `V_RECETA WHERE id_receta = ?`
* **POST `/`**: Registra una prescripción en `RECETA`.
  * **Cuerpo de la Petición (JSON)**:
    ```json
    {
      "id_receta": "REC-001",
      "id_expediente": "d0c40d10-8d87-447e-836e-99d26ad52ea5",
      "codigo_medicamento": "389221",
      "instrucciones": "Tomar 1 tableta cada 24 horas por 7 días",
      "estado_surtido": "PENDIENTE",
      "fecha_prescripcion": "2026-04-17 10:00:00"
    }
    ```
