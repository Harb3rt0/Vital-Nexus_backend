const db = require('../config/db');

// Obtener todos los expedientes a través de la vista global
const getExpedientes = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM V_EXPEDIENTE');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al obtener expedientes:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor al obtener expedientes.' });
  }
};

// Obtener el expediente por ID de paciente (Consulta global de emergencia/historial)
const getExpedientesByPaciente = async (req, res) => {
  const { id_paciente } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM V_EXPEDIENTE WHERE id_paciente = ? ORDER BY fecha_atencion DESC', [id_paciente]);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al obtener expedientes del paciente:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor al obtener los expedientes del paciente.' });
  }
};

// Registrar una nueva consulta en el expediente
const createExpediente = async (req, res) => {
  const { id_expediente, id_paciente, id_medico, id_establecimiento, fecha_atencion, motivo_consulta } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO EXPEDIENTE (id_expediente, id_paciente, id_medico, id_establecimiento, fecha_atencion, motivo_consulta) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_expediente, id_paciente, id_medico, id_establecimiento, fecha_atencion, motivo_consulta]
    );
    res.status(201).json({ success: true, message: 'Consulta agregada al expediente exitosamente.', data: { id_expediente, id_paciente } });
  } catch (error) {
    console.error('Error al registrar consulta en expediente:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor al registrar la consulta.' });
  }
};

module.exports = {
  getExpedientes,
  getExpedientesByPaciente,
  createExpediente
};
