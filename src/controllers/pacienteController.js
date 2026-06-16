const db = require('../config/db');

// Obtener todos los pacientes a través de la vista global (Transparencia de localización)
const getPacientes = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM V_PACIENTE');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor al obtener pacientes.' });
  }
};

// Obtener un paciente por su ID
const getPacienteById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM V_PACIENTE WHERE id_paciente = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Paciente no encontrado.' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error al obtener el paciente:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor al obtener el paciente.' });
  }
};

// Insertar un nuevo paciente (El backend decide en qué nodo real insertarlo o delega en el motor de DB)
// Para propósitos de este laboratorio, apuntamos a la tabla PACIENTE y los triggers/reglas manejarán la partición si aplica, 
// o la consulta se dirige a un nodo específico. 
const createPaciente = async (req, res) => {
  const { id_paciente, curp_ssn, nombre, apellido, fecha_nac, genero, ciudad_residencia, id_nodo_orig } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO PACIENTE (id_paciente, curp_ssn, nombre, apellido, fecha_nac, genero, ciudad_residencia, id_nodo_orig) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_paciente, curp_ssn, nombre, apellido, fecha_nac, genero, ciudad_residencia, id_nodo_orig]
    );
    res.status(201).json({ success: true, message: 'Paciente registrado exitosamente.', data: { id_paciente, nombre, apellido } });
  } catch (error) {
    console.error('Error al crear paciente:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor al registrar el paciente.' });
  }
};

module.exports = {
  getPacientes,
  getPacienteById,
  createPaciente
};
