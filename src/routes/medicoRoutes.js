const express = require('express');
const router = express.Router();

const medicoController = require('../controllers/medicoController');

router.get('/', medicoController.getMedicos);

router.get('/:id',
    medicoController.getMedicoById
);

router.post('/',
    medicoController.createMedico
);

// Nuevas rutas
router.put('/:id',
    medicoController.updateMedico
);

router.delete('/:id',
    medicoController.deleteMedico
);

module.exports = router;
