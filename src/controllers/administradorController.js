const db = require('../config/db');

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
    await db.query(
      `INSERT INTO ADMINISTRADOR (id_admin, username, password_hash, email, id_nodo_asig) 
       VALUES (?, ?, ?, ?, ?)`,
      [id_admin, username, password_hash, email, id_nodo_asig]
    );
    res.status(201).json({ success: true, message: 'Administrador registrado exitosamente.' });
  } catch (error) {
    console.error('Error al crear administrador:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

module.exports = { getAdministradores, getAdministradorById, createAdministrador };