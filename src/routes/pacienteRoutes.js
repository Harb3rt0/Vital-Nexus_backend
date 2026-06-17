const express = require('express');
const router = express.Router();

const pacienteController = require('../controllers/pacienteController');

// Obtener todos
router.get('/',
    pacienteController.getPacientes
);

// Obtener por CURP/SSN
router.get('/curp/:curp_ssn',
    pacienteController.getPacienteByCurpSsn
);

// Obtener uno
router.get('/:id',
    pacienteController.getPacienteById
);

// Crear
router.post('/',
    pacienteController.createPaciente
);

// Actualizar
router.put('/:id',
    pacienteController.updatePaciente
);

// Eliminar
router.delete('/:id',
    pacienteController.deletePaciente
);

module.exports = router;
