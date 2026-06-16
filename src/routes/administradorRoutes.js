const express = require('express');
const router = express.Router();
const administradorController = require('../controllers/administradorController');

router.get('/', administradorController.getAdministradores);
router.get('/:id', administradorController.getAdministradorById);
router.post('/', administradorController.createAdministrador);

module.exports = router;