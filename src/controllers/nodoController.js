const db = require('../config/db');

const getNodos = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM V_NODO');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al obtener nodos:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

const getNodoById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM V_NODO WHERE id_nodo = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Nodo no encontrado.' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error al obtener el nodo:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

const createNodo = async (req, res) => {
  const { id_nodo, nombre_region, ip_servidor, ubicacion_geografica } = req.body;
  try {
    await db.query(
      `INSERT INTO NODO (id_nodo, nombre_region, ip_servidor, ubicacion_geografica) 
       VALUES (?, ?, ?, ?)`,
      [id_nodo, nombre_region, ip_servidor, ubicacion_geografica]
    );
    res.status(201).json({ success: true, message: 'Nodo registrado exitosamente.' });
  } catch (error) {
    console.error('Error al crear nodo:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

module.exports = { getNodos, getNodoById, createNodo };