const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');

// Rutas para /api/pacientes
router.get('/', pacienteController.getPacientes);
router.get('/:id', pacienteController.getPacienteById);
router.post('/', pacienteController.createPaciente);

module.exports = router;
