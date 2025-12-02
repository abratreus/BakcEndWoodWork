const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');

// Definição das Rotas ligando aos novos nomes de métodos
router.get('/', categoriaController.getCategories);          
router.get('/:id', categoriaController.getCategory);        
router.post('/', categoriaController.createCategory);       
router.put('/:id', categoriaController.updateCategory);  
// 1. Soft Delete (Inativar) -> É uma atualização parcial
router.patch('/:id/inativar', categoriaController.softDeleteCategory);

// 2. Hard Delete (Apagar do banco) -> É uma remoção real
router.delete('/:id', categoriaController.deleteCategory);

module.exports = router;