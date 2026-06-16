const express = require('express');
const router = express.Router();

const nodoController = require('../controllers/nodoController');

router.get('/',
    nodoController.getNodos
);

router.get('/:id',
    nodoController.getNodoById
);

router.post('/',
    nodoController.createNodo
);

// Nuevas rutas
router.put('/:id',
    nodoController.updateNodo
);

router.delete('/:id',
    nodoController.deleteNodo
);

module.exports = router;
