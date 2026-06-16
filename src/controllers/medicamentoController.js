const db = require('../config/db');

const getMedicamentos = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM V_MEDICAMENTO');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al obtener medicamentos:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

const getMedicamentoById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM V_MEDICAMENTO WHERE codigo_medicamento = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Medicamento no encontrado.' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error al obtener el medicamento:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

const createMedicamento = async (req, res) => {
  const { codigo_medicamento, nombre_generico, costo_base, requiere_receta } = req.body;
  try {
    await db.query(
      `INSERT INTO MEDICAMENTO (codigo_medicamento, nombre_generico, costo_base, requiere_receta) 
       VALUES (?, ?, ?, ?)`,
      [codigo_medicamento, nombre_generico, costo_base, requiere_receta !== undefined ? requiere_receta : true]
    );
    res.status(201).json({ success: true, message: 'Medicamento registrado exitosamente.' });
  } catch (error) {
    console.error('Error al crear medicamento:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

module.exports = { getMedicamentos, getMedicamentoById, createMedicamento };