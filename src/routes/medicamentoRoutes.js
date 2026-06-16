const express = require('express');
const router = express.Router();

const medicamentoController = require('../controllers/medicamentoController');

router.get('/',
    medicamentoController.getMedicamentos
);

router.get('/:id',
    medicamentoController.getMedicamentoById
);

router.post('/',
    medicamentoController.createMedicamento
);

// Nuevas rutas
router.put('/:id',
    medicamentoController.updateMedicamento
);

router.delete('/:id',
    medicamentoController.deleteMedicamento
);

module.exports = router;
