const express = require('express');
const router = express.Router();

const inventarioController = require('../controllers/inventarioController');

router.get('/',
    inventarioController.getInventarios
);

router.get('/:id',
    inventarioController.getInventarioById
);

router.post('/',
    inventarioController.createInventario
);

// Nuevas rutas
router.put('/:id',
    inventarioController.updateInventario
);

router.delete('/:id',
    inventarioController.deleteInventario
);

module.exports = router;
