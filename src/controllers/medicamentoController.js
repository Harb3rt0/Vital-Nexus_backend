const db = require('../config/db');
const esClient = require('../config/elasticsearch');

const INDEX = 'medicamento';

const getMedicamentos = async (req, res) => {
  try {

    const [rows] = await db.query(
      'SELECT * FROM V_MEDICAMENTO'
    );

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {

    console.error(
      'Error al obtener medicamentos:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error en el servidor.'
    });

  }
};

const getMedicamentoById = async (req,res)=>{

  const { id } = req.params;

  try{

    const [rows] = await db.query(
      `SELECT *
       FROM V_MEDICAMENTO
       WHERE codigo_medicamento=?`,
      [id]
    );

    if(rows.length===0){

      return res.status(404).json({
        success:false,
        message:'Medicamento no encontrado.'
      });

    }

    res.json({
      success:true,
      data:rows[0]
    });

  }catch(error){

    console.error(
      'Error obteniendo medicamento:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error en el servidor.'
    });

  }
};

const createMedicamento = async(req,res)=>{

  const {
    codigo_medicamento,
    nombre_generico,
    costo_base,
    requiere_receta
  } = req.body;

  try{

    const receta =
      requiere_receta !== undefined
      ? requiere_receta
      : true;

    // Guardar MySQL
    await db.query(
      `INSERT INTO MEDICAMENTO
      (
        codigo_medicamento,
        nombre_generico,
        costo_base,
        requiere_receta
      )
      VALUES(?,?,?,?)`,
      [
        codigo_medicamento,
        nombre_generico,
        costo_base,
        receta
      ]
    );

    // Guardar Elasticsearch
    await esClient.index({
      index: INDEX,
      id: codigo_medicamento.toString(),
      document:{
        codigo_medicamento,
        nombre_generico,
        costo_base,
        requiere_receta: receta
      }
    });

    res.status(201).json({
      success:true,
      message:'Medicamento registrado exitosamente'
    });

  }catch(error){

    console.error(
      'Error creando medicamento:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error en el servidor.'
    });

  }
};

const updateMedicamento = async(req,res)=>{

  const { id } = req.params;

  const {
    nombre_generico,
    costo_base,
    requiere_receta
  } = req.body;

  try{

    // Actualizar MySQL
    await db.query(
      `UPDATE MEDICAMENTO
      SET nombre_generico=?,
          costo_base=?,
          requiere_receta=?
      WHERE codigo_medicamento=?`,
      [
        nombre_generico,
        costo_base,
        requiere_receta,
        id
      ]
    );

    // Actualizar Elasticsearch
    await esClient.update({
      index: INDEX,
      id:id.toString(),
      doc:{
        nombre_generico,
        costo_base,
        requiere_receta
      }
    });

    res.json({
      success:true,
      message:'Medicamento actualizado'
    });

  }catch(error){

    console.error(
      'Error actualizando medicamento:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error actualizando medicamento'
    });

  }
};

const deleteMedicamento = async(req,res)=>{

  const { id } = req.params;

  try{

    // Eliminar MySQL
    await db.query(
      `DELETE FROM MEDICAMENTO
      WHERE codigo_medicamento=?`,
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
      message:'Medicamento eliminado'
    });

  }catch(error){

    console.error(
      'Error eliminando medicamento:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error eliminando medicamento'
    });

  }
};

module.exports = {
  getMedicamentos,
  getMedicamentoById,
  createMedicamento,
  updateMedicamento,
  deleteMedicamento
};
