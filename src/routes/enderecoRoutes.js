const express = require('express');
const router = express.Router();
const EnderecoController = require('../controllers/enderecoController');

// CRUD básico
router.get('/', EnderecoController.getAddresses);
router.get('/:id', EnderecoController.getAddress);
router.post('/', EnderecoController.createAddress);
router.put('/:id', EnderecoController.updateAddress);
router.delete('/:id', EnderecoController.deleteAddress);

// Rota específica para buscar endereços de um usuário (ex: /usuarios/10/enderecos)
router.get('/usuarios/:usuarioId/enderecos', EnderecoController.getAddressesByUser);

module.exports = router;