const express = require('express');
const router = express.Router();

const administradorController = require('../controllers/administradorController');
const authMiddleware = require('../middlewares/authMiddleware');

// Públicas
router.post('/login', administradorController.loginAdministrador);
router.post('/logout', administradorController.logoutAdministrador);
router.post('/', administradorController.createAdministrador);

// Protegidas
router.get('/me',
    authMiddleware,
    administradorController.getPerfil
);

router.get('/',
    authMiddleware,
    administradorController.getAdministradores
);

router.get('/:id',
    authMiddleware,
    administradorController.getAdministradorById
);

// NUEVAS
router.put('/:id',
    authMiddleware,
    administradorController.updateAdministrador
);

router.delete('/:id',
    authMiddleware,
    administradorController.deleteAdministrador
);

module.exports = router;
