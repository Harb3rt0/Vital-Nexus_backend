const express = require('express');
const router = express.Router();

const establecimientoController = require('../controllers/establecimientoController');

router.get('/', establecimientoController.getEstablecimientos);

router.get('/:id',
    establecimientoController.getEstablecimientoById
);

router.post('/',
    establecimientoController.createEstablecimiento
);

// Nuevas rutas
router.put('/:id',
    establecimientoController.updateEstablecimiento
);

router.delete('/:id',
    establecimientoController.deleteEstablecimiento
);

module.exports = router;
