const db = require('../config/db');
const esClient = require('../config/elasticsearch');

const INDEX = 'medico';

const getMedicos = async (req, res) => {
  try {

    const [rows] = await db.query(
      'SELECT * FROM V_MEDICO'
    );

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {

    console.error(
      'Error al obtener médicos:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error en el servidor.'
    });

  }
};

const getMedicoById = async (req,res)=>{

  const { id } = req.params;

  try{

    const [rows] = await db.query(
      `SELECT *
       FROM V_MEDICO
       WHERE id_medico=?`,
      [id]
    );

    if(rows.length===0){

      return res.status(404).json({
        success:false,
        message:'Médico no encontrado.'
      });

    }

    res.json({
      success:true,
      data:rows[0]
    });

  }catch(error){

    console.error(
      'Error obteniendo médico:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error en el servidor.'
    });

  }
};

const createMedico = async(req,res)=>{

  const {
    id_medico,
    id_establecimiento,
    nombre_completo,
    especialidad,
    genero
  } = req.body;

  try{

    // Guardar MySQL
    await db.query(
      `INSERT INTO MEDICO
      (
        id_medico,
        id_establecimiento,
        nombre_completo,
        especialidad,
        genero
      )
      VALUES(?,?,?,?,?)`,
      [
        id_medico,
        id_establecimiento,
        nombre_completo,
        especialidad,
        genero
      ]
    );

    // Guardar Elasticsearch
    await esClient.index({
      index: INDEX,
      id:id_medico.toString(),
      document:{
        id_medico,
        id_establecimiento,
        nombre_completo,
        especialidad,
        genero
      }
    });

    res.status(201).json({
      success:true,
      message:'Médico registrado exitosamente'
    });

  }catch(error){

    console.error(
      'Error creando médico:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error en el servidor.'
    });

  }
};

const updateMedico = async(req,res)=>{

  const { id } = req.params;

  const {
    id_establecimiento,
    nombre_completo,
    especialidad,
    genero
  } = req.body;

  try{

    // Actualizar MySQL
    await db.query(
      `UPDATE MEDICO
      SET id_establecimiento=?,
          nombre_completo=?,
          especialidad=?,
          genero=?
      WHERE id_medico=?`,
      [
        id_establecimiento,
        nombre_completo,
        especialidad,
        genero,
        id
      ]
    );

    // Actualizar Elasticsearch
    await esClient.update({
      index: INDEX,
      id:id.toString(),
      doc:{
        id_establecimiento,
        nombre_completo,
        especialidad,
        genero
      }
    });

    res.json({
      success:true,
      message:'Médico actualizado'
    });

  }catch(error){

    console.error(
      'Error actualizando médico:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error actualizando médico'
    });

  }
};

const deleteMedico = async(req,res)=>{

  const { id } = req.params;

  try{

    // Eliminar MySQL
    await db.query(
      `DELETE FROM MEDICO
      WHERE id_medico=?`,
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
      message:'Médico eliminado'
    });

  }catch(error){

    console.error(
      'Error eliminando médico:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error eliminando médico'
    });

  }
};

module.exports = {
  getMedicos,
  getMedicoById,
  createMedico,
  updateMedico,
  deleteMedico
};
