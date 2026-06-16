const express = require('express');
const router = express.Router();
const medicoController = require('../controllers/medicoController');

router.get('/', medicoController.getMedicos);
router.get('/:id', medicoController.getMedicoById);
router.post('/', medicoController.createMedico);

module.exports = router;