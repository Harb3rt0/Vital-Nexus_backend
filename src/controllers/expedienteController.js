const db = require('../config/db');
const esClient = require('../config/elasticsearch');

const INDEX = 'expediente';

// Obtener todos los expedientes
const getExpedientes = async (req, res) => {
  try {

    const [rows] = await db.query(
      'SELECT * FROM V_EXPEDIENTE'
    );

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {

    console.error(
      'Error al obtener expedientes:',
      error
    );

    res.status(500).json({
      success: false,
      message: 'Error al obtener expedientes.'
    });

  }
};

// Obtener expediente por paciente
const getExpedientesByPaciente = async (req, res) => {

  const { id_paciente } = req.params;

  try {

    const [rows] = await db.query(
      `SELECT *
       FROM V_EXPEDIENTE
       WHERE id_paciente = ?
       ORDER BY fecha_atencion DESC`,
      [id_paciente]
    );

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {

    console.error(
      'Error al obtener expedientes:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error al obtener expedientes'
    });

  }
};

// Crear expediente
const createExpediente = async (req,res)=>{

  const {
    id_expediente,
    id_paciente,
    id_medico,
    id_establecimiento,
    fecha_atencion,
    motivo_consulta
  } = req.body;

  try{

    // Guardar MySQL
    await db.query(
      `INSERT INTO EXPEDIENTE
      (id_expediente,
      id_paciente,
      id_medico,
      id_establecimiento,
      fecha_atencion,
      motivo_consulta)
      VALUES(?,?,?,?,?,?)`,
      [
        id_expediente,
        id_paciente,
        id_medico,
        id_establecimiento,
        fecha_atencion,
        motivo_consulta
      ]
    );

    // Guardar Elasticsearch
    await esClient.index({
      index: INDEX,
      id: id_expediente.toString(),
      document:{
        id_expediente,
        id_paciente,
        id_medico,
        id_establecimiento,
        fecha_atencion,
        motivo_consulta
      }
    });

    res.status(201).json({
      success:true,
      message:'Consulta agregada al expediente exitosamente'
    });

  }catch(error){

    console.error(
      'Error creando expediente:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error registrando expediente'
    });

  }
};

// Actualizar expediente
const updateExpediente = async(req,res)=>{

  const { id } = req.params;

  const {
    fecha_atencion,
    motivo_consulta
  } = req.body;

  try{

    // Actualizar MySQL
    await db.query(
      `UPDATE EXPEDIENTE
      SET fecha_atencion=?,
          motivo_consulta=?
      WHERE id_expediente=?`,
      [
        fecha_atencion,
        motivo_consulta,
        id
      ]
    );

    // Actualizar Elasticsearch
    await esClient.update({
      index: INDEX,
      id:id.toString(),
      doc:{
        fecha_atencion,
        motivo_consulta
      }
    });

    res.json({
      success:true,
      message:'Expediente actualizado'
    });

  }catch(error){

    console.error(
      'Error actualizando expediente:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error actualizando expediente'
    });

  }
};

// Eliminar expediente
const deleteExpediente = async(req,res)=>{

  const { id } = req.params;

  try{

    // Eliminar MySQL
    await db.query(
      `DELETE FROM EXPEDIENTE
       WHERE id_expediente=?`,
      [id]
    );

    // Eliminar Elasticsearch
    try{

      await esClient.delete({
        index: INDEX,
        id:id.toString()
      });

    }catch(esError){

      if(
        esError.meta?.statusCode !== 404
      ){
        throw esError;
      }

    }

    res.json({
      success:true,
      message:'Expediente eliminado'
    });

  }catch(error){

    console.error(
      'Error eliminando expediente:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error eliminando expediente'
    });

  }
};

module.exports = {
  getExpedientes,
  getExpedientesByPaciente,
  createExpediente,
  updateExpediente,
  deleteExpediente
};
