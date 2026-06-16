const express = require('express');
const router = express.Router();
const recetaController = require('../controllers/recetaController');

router.get('/', recetaController.getRecetas);
router.get('/:id', recetaController.getRecetaById);
router.post('/', recetaController.createReceta);

module.exports = router;