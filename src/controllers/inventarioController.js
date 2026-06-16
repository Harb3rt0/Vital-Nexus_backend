const db = require('../config/db');

const getInventarios = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM V_INVENTARIO_MEDICAMENTO');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al obtener inventarios:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

const getInventarioById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM V_INVENTARIO_MEDICAMENTO WHERE id_inventario = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Inventario no encontrado.' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error al obtener el inventario:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

const createInventario = async (req, res) => {
  const { id_inventario, id_establecimiento, codigo_medicamento, stock_actual } = req.body;
  try {
    await db.query(
      `INSERT INTO INVENTARIO_MEDICAMENTO (id_inventario, id_establecimiento, codigo_medicamento, stock_actual) 
       VALUES (?, ?, ?, ?)`,
      [id_inventario, id_establecimiento, codigo_medicamento, stock_actual || 0]
    );
    res.status(201).json({ success: true, message: 'Inventario registrado exitosamente.' });
  } catch (error) {
    console.error('Error al crear inventario:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

module.exports = { getInventarios, getInventarioById, createInventario };