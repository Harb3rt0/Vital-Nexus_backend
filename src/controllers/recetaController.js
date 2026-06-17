const db = require('../config/db');
const esClient = require('../config/elasticsearch');

const INDEX = 'receta';

const getRecetas = async (req, res) => {
  try {

    const [rows] = await db.query(
      'SELECT * FROM V_RECETA'
    );

    res.json({
      success:true,
      data:rows
    });

  } catch(error){

    console.error(
      'Error al obtener recetas:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error en el servidor.'
    });

  }
};

const getRecetaById = async(req,res)=>{

  const { id } = req.params;

  try{

    const [rows] = await db.query(
      `SELECT *
      FROM V_RECETA
      WHERE id_receta=?`,
      [id]
    );

    if(rows.length===0){

      return res.status(404).json({
        success:false,
        message:'Receta no encontrada.'
      });

    }

    res.json({
      success:true,
      data:rows[0]
    });

  }catch(error){

    console.error(
      'Error obteniendo receta:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error en el servidor.'
    });

  }
};

const createReceta = async(req,res)=>{

  const {
    id_receta,
    id_expediente,
    codigo_medicamento,
    instrucciones,
    estado_surtido,
    fecha_prescripcion
  } = req.body;

  try{

    // Guardar MySQL
    await db.query(
      `INSERT INTO RECETA
      (
        id_receta,
        id_expediente,
        codigo_medicamento,
        instrucciones,
        estado_surtido,
        fecha_prescripcion
      )
      VALUES(?,?,?,?,?,?)`,
      [
        id_receta,
        id_expediente,
        codigo_medicamento,
        instrucciones,
        estado_surtido,
        fecha_prescripcion
      ]
    );

    // Guardar Elasticsearch (no bloqueante)
    try {
      await esClient.index({
        index: INDEX,
        id:id_receta.toString(),
        document:{
          id_receta,
          id_expediente,
          codigo_medicamento,
          instrucciones,
          estado_surtido,
          fecha_prescripcion
        }
      });
    } catch(esError) {
      console.warn(`[Elasticsearch WARNING] No se pudo indexar la receta en Elasticsearch:`, esError.message);
    }

    res.status(201).json({
      success:true,
      message:'Receta registrada exitosamente'
    });

  }catch(error){

    console.error(
      'Error creando receta:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error en el servidor.'
    });

  }
};

const updateReceta = async(req,res)=>{

  const { id } = req.params;

  const {
    instrucciones,
    estado_surtido,
    fecha_prescripcion
  } = req.body;

  try{

    // Actualizar MySQL
    await db.query(
      `UPDATE RECETA
      SET instrucciones=?,
          estado_surtido=?,
          fecha_prescripcion=?
      WHERE id_receta=?`,
      [
        instrucciones,
        estado_surtido,
        fecha_prescripcion,
        id
      ]
    );

    // Actualizar Elasticsearch (no bloqueante)
    try {
      await esClient.update({
        index: INDEX,
        id:id.toString(),
        doc:{
          instrucciones,
          estado_surtido,
          fecha_prescripcion
        }
      });
    } catch(esError) {
      console.warn(`[Elasticsearch WARNING] No se pudo actualizar la receta en Elasticsearch:`, esError.message);
    }

    res.json({
      success:true,
      message:'Receta actualizada'
    });

  }catch(error){

    console.error(
      'Error actualizando receta:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error actualizando receta'
    });

  }
};

const deleteReceta = async(req,res)=>{

  const { id } = req.params;

  try{

    // Eliminar MySQL
    await db.query(
      `DELETE FROM RECETA
      WHERE id_receta=?`,
      [id]
    );

    // Eliminar Elasticsearch (no bloqueante)
    try{
      await esClient.delete({
        index: INDEX,
        id:id.toString()
      });
    }catch(esError){
      console.warn(`[Elasticsearch WARNING] No se pudo eliminar la receta de Elasticsearch:`, esError.message);
    }

    res.json({
      success:true,
      message:'Receta eliminado'
    });

  }catch(error){

    console.error(
      'Error eliminando receta:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error eliminando receta'
    });

  }
};

module.exports = {
  getRecetas,
  getRecetaById,
  createReceta,
  updateReceta,
  deleteReceta
};
