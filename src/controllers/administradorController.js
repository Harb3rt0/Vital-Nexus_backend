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

    // Guardar en Elasticsearch (no bloqueante)
    try {
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
    } catch(esError) {
      console.warn(`[Elasticsearch WARNING] No se pudo indexar el administrador en Elasticsearch:`, esError.message);
    }

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

    // Actualizar en Elasticsearch (no bloqueante)
    try {
      await esClient.update({
        index: INDEX,
        id:id.toString(),
        doc:{
          username,
          email,
          id_nodo_asig
        }
      });
    } catch(esError) {
      console.warn(`[Elasticsearch WARNING] No se pudo actualizar el administrador en Elasticsearch:`, esError.message);
    }

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

    // Eliminar de Elasticsearch (no bloqueante)
    try{
      await esClient.delete({
        index: INDEX,
        id:id.toString()
      });
    }catch(esError){
      console.warn(`[Elasticsearch WARNING] No se pudo eliminar el administrador de Elasticsearch:`, esError.message);
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

const loginAdministrador = async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Usuario y contraseña son requeridos.' });
    }

    const [rows] = await db.query('SELECT * FROM V_ADMINISTRADOR WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
    }

    const admin = rows[0];
    const hashed = crypto.createHash('sha256').update(password).digest('hex');
    if (admin.password_hash !== hashed) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
    }

    const secret = process.env.JWT_SECRET || 'super_secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '2h';
    const payload = {
      id_admin: admin.id_admin,
      username: admin.username,
      email: admin.email,
      id_nodo_asig: admin.id_nodo_asig
    };

    const token = jwt.sign(payload, secret, { expiresIn });

    const sessionLifetime = parseInt(process.env.SESSION_LIFETIME) || 7200000;
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: sessionLifetime
    });

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso.',
      data: payload
    });
  } catch (error) {
    console.error('Error en el login del administrador:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

const logoutAdministrador = async (req, res) => {
  try {
    res.clearCookie('admin_token');
    res.json({ success: true, message: 'Sesión cerrada exitosamente.' });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

const getPerfil = async (req, res) => {
  try {
    res.json({ success: true, data: req.admin });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

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
