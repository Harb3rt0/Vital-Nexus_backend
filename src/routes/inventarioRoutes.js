const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');

router.get('/', inventarioController.getInventarios);
router.get('/:id', inventarioController.getInventarioById);
router.post('/', inventarioController.createInventario);

module.exports = router;