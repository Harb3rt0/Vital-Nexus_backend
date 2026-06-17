const db = require('../config/db');
const esClient = require('../config/elasticsearch');

const INDEX = 'paciente';

const getPacientes = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM V_PACIENTE');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor al obtener pacientes.' });
  }
};

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

const getPacienteByCurpSsn = async (req, res) => {
  const { curp_ssn } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM V_PACIENTE WHERE curp_ssn = ?', [curp_ssn]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Paciente no encontrado.' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error al obtener el paciente por CURP/SSN:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor al obtener el paciente.' });
  }
};

const createPaciente = async (req, res) => {
    const {
        id_paciente,
        curp_ssn,
        nombre,
        apellido,
        fecha_nac,
        genero,
        ciudad_residencia,
        id_nodo_orig
    } = req.body;

    try {
        // Guardar en MySQL
        await db.query(
            `INSERT INTO PACIENTE
            (id_paciente, curp_ssn, nombre, apellido,
             fecha_nac, genero, ciudad_residencia, id_nodo_orig)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id_paciente,
                curp_ssn,
                nombre,
                apellido,
                fecha_nac,
                genero,
                ciudad_residencia,
                id_nodo_orig
            ]
        );

        // Guardar en Elasticsearch (no bloqueante)
        try {
            await esClient.index({
                index: INDEX,
                id: id_paciente.toString(),
                document: {
                    id_paciente,
                    curp_ssn,
                    nombre,
                    apellido,
                    fecha_nac,
                    genero,
                    ciudad_residencia,
                    id_nodo_orig
                }
            });
        } catch(esError) {
            console.warn(`[Elasticsearch WARNING] No se pudo indexar el paciente en Elasticsearch:`, esError.message);
        }

        res.status(201).json({
            success:true,
            message:'Paciente registrado correctamente'
        });

    } catch(error){
        console.error(
            'Error creando paciente:',
            error
        );

        res.status(500).json({
            success:false,
            message:'Error al registrar paciente'
        });
    }
};

const updatePaciente = async (req,res)=>{
    const { id } = req.params;
    const datos = req.body;

    try{
        await db.query(
            `UPDATE PACIENTE
            SET nombre=?,
                apellido=?,
                ciudad_residencia=?
            WHERE id_paciente=?`,
            [
                datos.nombre,
                datos.apellido,
                datos.ciudad_residencia,
                id
            ]
        );

        // Actualizar Elasticsearch (no bloqueante)
        try {
            await esClient.update({
                index: INDEX,
                id: id.toString(),
                doc: datos
            });
        } catch(esError) {
            console.warn(`[Elasticsearch WARNING] No se pudo actualizar el paciente en Elasticsearch:`, esError.message);
        }

        res.json({
            success:true,
            message:'Paciente actualizado'
        });

    }catch(error){
        console.error(error);

        res.status(500).json({
            success:false,
            message:'Error al actualizar'
        });
    }
};

const deletePaciente = async(req,res)=>{
    const { id } = req.params;

    try{
        await db.query(
            `DELETE FROM PACIENTE
             WHERE id_paciente=?`,
             [id]
        );

        // Eliminar Elasticsearch (no bloqueante)
        try{
            await esClient.delete({
                index: INDEX,
                id: id.toString()
            });
        }catch(esError){
            console.warn(`[Elasticsearch WARNING] No se pudo eliminar el paciente de Elasticsearch:`, esError.message);
        }

        res.json({
            success:true,
            message:'Paciente eliminado'
        });

    }catch(error){
        console.error(error);

        res.status(500).json({
            success:false,
            message:'Error eliminando paciente'
        });
    }
};

module.exports = {
    getPacientes,
    getPacienteById,
    getPacienteByCurpSsn,
    createPaciente,
    updatePaciente,
    deletePaciente
};
