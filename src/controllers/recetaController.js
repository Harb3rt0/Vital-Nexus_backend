const db = require('../config/db');

const getRecetas = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM V_RECETA');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al obtener recetas:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

const getRecetaById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM V_RECETA WHERE id_receta = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Receta no encontrada.' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error al obtener la receta:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

const createReceta = async (req, res) => {
  const { id_receta, id_expediente, codigo_medicamento, instrucciones, estado_surtido, fecha_prescripcion } = req.body;
  try {
    await db.query(
      `INSERT INTO RECETA (id_receta, id_expediente, codigo_medicamento, instrucciones, estado_surtido, fecha_prescripcion) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_receta, id_expediente, codigo_medicamento, instrucciones, estado_surtido, fecha_prescripcion]
    );
    res.status(201).json({ success: true, message: 'Receta registrada exitosamente.' });
  } catch (error) {
    console.error('Error al crear receta:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

module.exports = { getRecetas, getRecetaById, createReceta };