const db = require('../config/db');

const getMedicos = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM V_MEDICO');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al obtener médicos:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

const getMedicoById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM V_MEDICO WHERE id_medico = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Médico no encontrado.' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error al obtener el médico:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

const createMedico = async (req, res) => {
  const { id_medico, id_establecimiento, nombre_completo, especialidad, genero } = req.body;
  try {
    await db.query(
      `INSERT INTO MEDICO (id_medico, id_establecimiento, nombre_completo, especialidad, genero) 
       VALUES (?, ?, ?, ?, ?)`,
      [id_medico, id_establecimiento, nombre_completo, especialidad, genero]
    );
    res.status(201).json({ success: true, message: 'Médico registrado exitosamente.' });
  } catch (error) {
    console.error('Error al crear médico:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

module.exports = { getMedicos, getMedicoById, createMedico };