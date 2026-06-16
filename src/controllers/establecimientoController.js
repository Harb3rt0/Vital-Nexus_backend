const db = require('../config/db');
const esClient = require('../config/elasticsearch');

const INDEX = 'establecimiento';

const getEstablecimientos = async (req, res) => {
  try {

    const [rows] = await db.query(
      'SELECT * FROM V_ESTABLECIMIENTO'
    );

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {

    console.error(
      'Error al obtener establecimientos:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error en el servidor.'
    });

  }
};

const getEstablecimientoById = async (req,res)=>{

  const { id } = req.params;

  try{

    const [rows] = await db.query(
      'SELECT * FROM V_ESTABLECIMIENTO WHERE id_establecimiento=?',
      [id]
    );

    if(rows.length===0){

      return res.status(404).json({
        success:false,
        message:'Establecimiento no encontrado.'
      });

    }

    res.json({
      success:true,
      data:rows[0]
    });

  }catch(error){

    console.error(
      'Error al obtener establecimiento:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error en el servidor.'
    });

  }
};

const createEstablecimiento = async(req,res)=>{

  const {
    id_establecimiento,
    nombre,
    direccion,
    ciudad,
    codigo_postal,
    id_nodo_asig
  } = req.body;

  try{

    // Guardar MySQL
    await db.query(
      `INSERT INTO ESTABLECIMIENTO
      (id_establecimiento,nombre,direccion,
      ciudad,codigo_postal,id_nodo_asig)
      VALUES(?,?,?,?,?,?)`,
      [
        id_establecimiento,
        nombre,
        direccion,
        ciudad,
        codigo_postal,
        id_nodo_asig
      ]
    );

    // Guardar Elasticsearch
    await esClient.index({
      index: INDEX,
      id: id_establecimiento.toString(),
      document:{
        id_establecimiento,
        nombre,
        direccion,
        ciudad,
        codigo_postal,
        id_nodo_asig
      }
    });

    res.status(201).json({
      success:true,
      message:'Establecimiento registrado exitosamente'
    });

  }catch(error){

    console.error(
      'Error al crear establecimiento:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error en el servidor.'
    });

  }
};

const updateEstablecimiento = async(req,res)=>{

  const { id } = req.params;

  const {
    nombre,
    direccion,
    ciudad,
    codigo_postal,
    id_nodo_asig
  } = req.body;

  try{

    // Actualizar MySQL
    await db.query(
      `UPDATE ESTABLECIMIENTO
      SET nombre=?,
          direccion=?,
          ciudad=?,
          codigo_postal=?,
          id_nodo_asig=?
      WHERE id_establecimiento=?`,
      [
        nombre,
        direccion,
        ciudad,
        codigo_postal,
        id_nodo_asig,
        id
      ]
    );

    // Actualizar Elasticsearch
    await esClient.update({
      index: INDEX,
      id:id.toString(),
      doc:{
        nombre,
        direccion,
        ciudad,
        codigo_postal,
        id_nodo_asig
      }
    });

    res.json({
      success:true,
      message:'Establecimiento actualizado'
    });

  }catch(error){

    console.error(
      'Error al actualizar establecimiento:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error actualizando establecimiento'
    });

  }
};

const deleteEstablecimiento = async(req,res)=>{

  const { id } = req.params;

  try{

    // Eliminar MySQL
    await db.query(
      `DELETE FROM ESTABLECIMIENTO
      WHERE id_establecimiento=?`,
      [id]
    );

    // Eliminar Elasticsearch
    try{

      await esClient.delete({
        index:INDEX,
        id:id.toString()
      });

    }catch(esError){

      if(
        esError.meta?.statusCode!==404
      ){
        throw esError;
      }

    }

    res.json({
      success:true,
      message:'Establecimiento eliminado'
    });

  }catch(error){

    console.error(
      'Error eliminando establecimiento:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error eliminando establecimiento'
    });

  }
};

module.exports = {
  getEstablecimientos,
  getEstablecimientoById,
  createEstablecimiento,
  updateEstablecimiento,
  deleteEstablecimiento
};
