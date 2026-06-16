const express = require('express');
const router = express.Router();
const establecimientoController = require('../controllers/establecimientoController');

router.get('/', establecimientoController.getEstablecimientos);
router.get('/:id', establecimientoController.getEstablecimientoById);
router.post('/', establecimientoController.createEstablecimiento);

module.exports = router;