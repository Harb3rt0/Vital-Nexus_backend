const db = require('../config/db');
const esClient = require('../config/elasticsearch');

const INDEX = 'inventario_medicamento';

const getInventarios = async (req, res) => {
  try {

    const [rows] = await db.query(
      'SELECT * FROM V_INVENTARIO_MEDICAMENTO'
    );

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {

    console.error(
      'Error al obtener inventarios:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error en el servidor.'
    });

  }
};

const getInventarioById = async (req,res)=>{

  const { id } = req.params;

  try{

    const [rows] = await db.query(
      `SELECT *
       FROM V_INVENTARIO_MEDICAMENTO
       WHERE id_inventario=?`,
      [id]
    );

    if(rows.length===0){

      return res.status(404).json({
        success:false,
        message:'Inventario no encontrado.'
      });

    }

    res.json({
      success:true,
      data:rows[0]
    });

  }catch(error){

    console.error(
      'Error obteniendo inventario:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error en el servidor.'
    });

  }
};

const createInventario = async(req,res)=>{

  const {
    id_inventario,
    id_establecimiento,
    codigo_medicamento,
    stock_actual
  } = req.body;

  try{

    const stock = stock_actual || 0;

    // Guardar en MySQL
    await db.query(
      `INSERT INTO INVENTARIO_MEDICAMENTO
      (
        id_inventario,
        id_establecimiento,
        codigo_medicamento,
        stock_actual
      )
      VALUES(?,?,?,?)`,
      [
        id_inventario,
        id_establecimiento,
        codigo_medicamento,
        stock
      ]
    );

    // Guardar en Elasticsearch (no bloqueante)
    try {
      await esClient.index({
        index: INDEX,
        id:id_inventario.toString(),
        document:{
          id_inventario,
          id_establecimiento,
          codigo_medicamento,
          stock_actual:stock
        }
      });
    } catch(esError) {
      console.warn(`[Elasticsearch WARNING] No se pudo indexar el inventario en Elasticsearch:`, esError.message);
    }

    res.status(201).json({
      success:true,
      message:'Inventario registrado exitosamente'
    });

  }catch(error){

    console.error(
      'Error creando inventario:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error en el servidor.'
    });

  }
};

const updateInventario = async(req,res)=>{

  const { id } = req.params;

  const {
    id_establecimiento,
    codigo_medicamento,
    stock_actual
  } = req.body;

  try{

    // Actualizar MySQL
    await db.query(
      `UPDATE INVENTARIO_MEDICAMENTO
      SET id_establecimiento=?,
          codigo_medicamento=?,
          stock_actual=?
      WHERE id_inventario=?`,
      [
        id_establecimiento,
        codigo_medicamento,
        stock_actual,
        id
      ]
    );

    // Actualizar Elasticsearch (no bloqueante)
    try {
      await esClient.update({
        index: INDEX,
        id:id.toString(),
        doc:{
          id_establecimiento,
          codigo_medicamento,
          stock_actual
        }
      });
    } catch(esError) {
      console.warn(`[Elasticsearch WARNING] No se pudo actualizar el inventario en Elasticsearch:`, esError.message);
    }

    res.json({
      success:true,
      message:'Inventario actualizado'
    });

  }catch(error){

    console.error(
      'Error actualizando inventario:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error actualizando inventario'
    });

  }
};

const deleteInventario = async(req,res)=>{

  const { id } = req.params;

  try{

    // Eliminar MySQL
    await db.query(
      `DELETE FROM INVENTARIO_MEDICAMENTO
      WHERE id_inventario=?`,
      [id]
    );

    // Eliminar Elasticsearch (no bloqueante)
    try{
      await esClient.delete({
        index:INDEX,
        id:id.toString()
      });
    }catch(esError){
      console.warn(`[Elasticsearch WARNING] No se pudo eliminar el inventario de Elasticsearch:`, esError.message);
    }

    res.json({
      success:true,
      message:'Inventario eliminado'
    });

  }catch(error){

    console.error(
      'Error eliminando inventario:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error eliminando inventario'
    });

  }
};

module.exports = {
  getInventarios,
  getInventarioById,
  createInventario,
  updateInventario,
  deleteInventario
};
