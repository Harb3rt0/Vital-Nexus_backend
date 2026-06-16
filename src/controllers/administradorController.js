const db = require('../config/db');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const esClient = require('../config/elasticsearch');

const INDEX = 'administrador';

const getAdministradores = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM V_ADMINISTRADOR'
    );

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {

    console.error(
      'Error al obtener administradores:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error en el servidor.'
    });
  }
};

const getAdministradorById = async (req,res)=>{

  const { id } = req.params;

  try{

    const [rows] = await db.query(
      'SELECT * FROM V_ADMINISTRADOR WHERE id_admin=?',
      [id]
    );

    if(rows.length===0){

      return res.status(404).json({
        success:false,
        message:'Administrador no encontrado.'
      });

    }

    res.json({
      success:true,
      data:rows[0]
    });

  }catch(error){

    console.error(error);

    res.status(500).json({
      success:false,
      message:'Error en el servidor.'
    });
  }
};

const createAdministrador = async(req,res)=>{

  const {
    id_admin,
    username,
    password_hash,
    email,
    id_nodo_asig
  } = req.body;

  try{

    if(!password_hash){

      return res.status(400).json({
        success:false,
        message:'La contraseña es requerida.'
      });

    }

    const hashed = crypto
      .createHash('sha256')
      .update(password_hash)
      .digest('hex');

    await db.query(
      `INSERT INTO ADMINISTRADOR
      (id_admin,username,password_hash,email,id_nodo_asig)
      VALUES(?,?,?,?,?)`,
      [
        id_admin,
        username,
        hashed,
        email,
        id_nodo_asig
      ]
    );

    // Guardar en Elasticsearch
    await esClient.index({
      index: INDEX,
      id: id_admin.toString(),
      document:{
        id_admin,
        username,
        email,
        id_nodo_asig
      }
    });

    res.status(201).json({
      success:true,
      message:'Administrador registrado exitosamente'
    });

  }catch(error){

    console.error(
      'Error al crear administrador:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Error en el servidor.'
    });

  }
};

const updateAdministrador = async(req,res)=>{

  const { id } = req.params;
  const {
    username,
    email,
    id_nodo_asig
  } = req.body;

  try{

    await db.query(
      `UPDATE ADMINISTRADOR
      SET username=?,
          email=?,
          id_nodo_asig=?
      WHERE id_admin=?`,
      [
        username,
        email,
        id_nodo_asig,
        id
      ]
    );

    await esClient.update({
      index: INDEX,
      id:id.toString(),
      doc:{
        username,
        email,
        id_nodo_asig
      }
    });

    res.json({
      success:true,
      message:'Administrador actualizado'
    });

  }catch(error){

    console.error(error);

    res.status(500).json({
      success:false,
      message:'Error actualizando administrador'
    });

  }
};

const deleteAdministrador = async(req,res)=>{

  const { id } = req.params;

  try{

    await db.query(
      `DELETE FROM ADMINISTRADOR
      WHERE id_admin=?`,
      [id]
    );

    try{

      await esClient.delete({
        index: INDEX,
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
      message:'Administrador eliminado'
    });

  }catch(error){

    console.error(error);

    res.status(500).json({
      success:false,
      message:'Error eliminando administrador'
    });

  }
};

// Mantener login, logout y perfil EXACTAMENTE igual

module.exports = {
  getAdministradores,
  getAdministradorById,
  createAdministrador,
  updateAdministrador,
  deleteAdministrador,
  loginAdministrador,
  logoutAdministrador,
  getPerfil
};
