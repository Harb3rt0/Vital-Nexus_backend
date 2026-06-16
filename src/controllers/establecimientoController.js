const db = require('../config/db');

const getEstablecimientos = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM V_ESTABLECIMIENTO');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al obtener establecimientos:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

const getEstablecimientoById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM V_ESTABLECIMIENTO WHERE id_establecimiento = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Establecimiento no encontrado.' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error al obtener el establecimiento:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

const createEstablecimiento = async (req, res) => {
  const { id_establecimiento, nombre, direccion, ciudad, codigo_postal, id_nodo_asig } = req.body;
  try {
    await db.query(
      `INSERT INTO ESTABLECIMIENTO (id_establecimiento, nombre, direccion, ciudad, codigo_postal, id_nodo_asig) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_establecimiento, nombre, direccion, ciudad, codigo_postal, id_nodo_asig]
    );
    res.status(201).json({ success: true, message: 'Establecimiento registrado exitosamente.' });
  } catch (error) {
    console.error('Error al crear establecimiento:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

module.exports = { getEstablecimientos, getEstablecimientoById, createEstablecimiento };