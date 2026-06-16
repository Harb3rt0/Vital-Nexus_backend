const express = require('express');
const router = express.Router();
const expedienteController = require('../controllers/expedienteController');

// Rutas para /api/expedientes
router.get('/', expedienteController.getExpedientes);
router.get('/paciente/:id_paciente', expedienteController.getExpedientesByPaciente);
router.post('/', expedienteController.createExpediente);

module.exports = router;
