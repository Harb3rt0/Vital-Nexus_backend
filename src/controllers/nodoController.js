const db = require('../config/db');
const esClient = require('../config/elasticsearch');

const INDEX = 'nodo';

const getNodos = async (req, res) => {
  try {

    const [rows] = await db.query(
      'SELECT * FROM V_NODO'
    );

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {

    console.error(
      'Error al obtener nodos:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error en el servidor.'
    });

  }
};

const getNodoById = async (req,res)=>{

  const { id } = req.params;

  try{

    const [rows] = await db.query(
      `SELECT *
      FROM V_NODO
      WHERE id_nodo=?`,
      [id]
    );

    if(rows.length===0){

      return res.status(404).json({
        success:false,
        message:'Nodo no encontrado.'
      });

    }

    res.json({
      success:true,
      data:rows[0]
    });

  }catch(error){

    console.error(
      'Error al obtener nodo:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error en el servidor.'
    });

  }
};

const createNodo = async(req,res)=>{

  const {
    id_nodo,
    nombre_region,
    ip_servidor,
    ubicacion_geografica
  } = req.body;

  try{

    // Guardar MySQL
    await db.query(
      `INSERT INTO NODO
      (
        id_nodo,
        nombre_region,
        ip_servidor,
        ubicacion_geografica
      )
      VALUES(?,?,?,?)`,
      [
        id_nodo,
        nombre_region,
        ip_servidor,
        ubicacion_geografica
      ]
    );

    // Guardar Elasticsearch
    await esClient.index({
      index: INDEX,
      id:id_nodo.toString(),
      document:{
        id_nodo,
        nombre_region,
        ip_servidor,
        ubicacion_geografica
      }
    });

    res.status(201).json({
      success:true,
      message:'Nodo registrado exitosamente'
    });

  }catch(error){

    console.error(
      'Error al crear nodo:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error en el servidor.'
    });

  }
};

const updateNodo = async(req,res)=>{

  const { id } = req.params;

  const {
    nombre_region,
    ip_servidor,
    ubicacion_geografica
  } = req.body;

  try{

    // Actualizar MySQL
    await db.query(
      `UPDATE NODO
      SET nombre_region=?,
          ip_servidor=?,
          ubicacion_geografica=?
      WHERE id_nodo=?`,
      [
        nombre_region,
        ip_servidor,
        ubicacion_geografica,
        id
      ]
    );

    // Actualizar Elasticsearch
    await esClient.update({
      index: INDEX,
      id:id.toString(),
      doc:{
        nombre_region,
        ip_servidor,
        ubicacion_geografica
      }
    });

    res.json({
      success:true,
      message:'Nodo actualizado'
    });

  }catch(error){

    console.error(
      'Error actualizando nodo:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error actualizando nodo'
    });

  }
};

const deleteNodo = async(req,res)=>{

  const { id } = req.params;

  try{

    // Eliminar MySQL
    await db.query(
      `DELETE FROM NODO
      WHERE id_nodo=?`,
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
      message:'Nodo eliminado'
    });

  }catch(error){

    console.error(
      'Error eliminando nodo:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error eliminando nodo'
    });

  }
};

module.exports = {
  getNodos,
  getNodoById,
  createNodo,
  updateNodo,
  deleteNodo
};
