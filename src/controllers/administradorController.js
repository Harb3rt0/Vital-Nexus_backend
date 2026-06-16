const db = require('../config/db');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const getAdministradores = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM V_ADMINISTRADOR');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al obtener administradores:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

const getAdministradorById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM V_ADMINISTRADOR WHERE id_admin = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Administrador no encontrado.' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error al obtener el administrador:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

const createAdministrador = async (req, res) => {
  const { id_admin, username, password_hash, email, id_nodo_asig } = req.body;
  try {
    if (!password_hash) {
      return res.status(400).json({ success: false, message: 'La contraseña es requerida.' });
    }

    // Hashear la contraseña usando SHA-256 nativo de Node (compatible con SHA2(?, 256) de MySQL)
    const hashed = crypto.createHash('sha256').update(password_hash).digest('hex');

    await db.query(
      `INSERT INTO ADMINISTRADOR (id_admin, username, password_hash, email, id_nodo_asig) 
       VALUES (?, ?, ?, ?, ?)`,
      [id_admin, username, hashed, email, id_nodo_asig]
    );
    res.status(201).json({ success: true, message: 'Administrador registrado exitosamente.' });
  } catch (error) {
    console.error('Error al crear administrador:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

const loginAdministrador = async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Usuario y contraseña son requeridos.' });
    }

    // Buscar el administrador en la vista global unificada para transparencia de localización
    const [rows] = await db.query('SELECT * FROM V_ADMINISTRADOR WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos.' });
    }

    const admin = rows[0];

    // Cifrar la contraseña provista para comparar con el hash guardado
    const inputHash = crypto.createHash('sha256').update(password).digest('hex');

    // Comparar hashes (fuerza minúsculas para robustez)
    if (inputHash !== admin.password_hash.toLowerCase()) {
      return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos.' });
    }

    // Generar Token JWT con datos del admin
    const secret = process.env.JWT_SECRET || 'vital_nexus_super_secret_key_2026';
    const expiresIn = process.env.JWT_EXPIRES_IN || '2h';
    const payload = {
      id_admin: admin.id_admin,
      username: admin.username,
      email: admin.email,
      id_nodo_asig: admin.id_nodo_asig
    };

    const token = jwt.sign(payload, secret, { expiresIn });

    // Guardar token en cookie HttpOnly y SameSite para mayor seguridad
    const sessionLifetime = parseInt(process.env.SESSION_LIFETIME);
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: sessionLifetime
    });

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso.',
      data: payload
    });
  } catch (error) {
    console.error('Error en el login del administrador:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

const logoutAdministrador = async (req, res) => {
  try {
    res.clearCookie('admin_token');
    res.json({ success: true, message: 'Sesión cerrada exitosamente.' });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

const getPerfil = async (req, res) => {
  try {
    // Retorna los datos del admin guardados en el token por el middleware de autenticación
    res.json({ success: true, data: req.admin });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

module.exports = {
  getAdministradores,
  getAdministradorById,
  createAdministrador,
  loginAdministrador,
  logoutAdministrador,
  getPerfil
};