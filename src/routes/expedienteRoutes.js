const express = require('express');
const router = express.Router();

const expedienteController = require('../controllers/expedienteController');

// Obtener todos
router.get('/',
    expedienteController.getExpedientes
);

// Obtener expedientes por CURP/SSN de paciente
router.get('/paciente/curp/:curp_ssn',
    expedienteController.getExpedientesByPacienteCurpSsn
);

// Obtener expedientes por paciente
router.get('/paciente/:id_paciente',
    expedienteController.getExpedientesByPaciente
);

// Crear
router.post('/',
    expedienteController.createExpediente
);

// Actualizar expediente
router.put('/:id',
    expedienteController.updateExpediente
);

// Eliminar expediente
router.delete('/:id',
    expedienteController.deleteExpediente
);

module.exports = router;
