const express = require('express');
const router = express.Router();
const medicamentoController = require('../controllers/medicamentoController');

router.get('/', medicamentoController.getMedicamentos);
router.get('/:id', medicamentoController.getMedicamentoById);
router.post('/', medicamentoController.createMedicamento);

module.exports = router;