const express = require('express');
const router = express.Router();
const administradorController = require('../controllers/administradorController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas Públicas
router.post('/login', administradorController.loginAdministrador);
router.post('/logout', administradorController.logoutAdministrador);
router.post('/', administradorController.createAdministrador); // Registro inicial

// Rutas Protegidas
router.get('/me', authMiddleware, administradorController.getPerfil);
router.get('/', authMiddleware, administradorController.getAdministradores);
router.get('/:id', authMiddleware, administradorController.getAdministradorById);

module.exports = router;