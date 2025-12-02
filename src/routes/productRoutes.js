//  Caminho: ('/src/routes/productRoutes.js')
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../config/uploadImage'); // Importa o middleware

// Definição das Rotas ligando aos novos nomes de métodos
router.get('/', productController.getProducts);          // Antes era getAllProducts
router.get('/:id', productController.getProduct);        // Antes era getProductById
router.post('/', upload.array('imagens', 5), productController.createProduct);

// ATUALIZAÇÃO: Também aceita novas fotos
router.put('/:id', upload.array('imagens', 5), productController.updateProduct);
// 1. Soft Delete (Inativar) -> É uma atualização parcial
router.patch('/:id/inativar', productController.softDeleteProduct);

// 2. Hard Delete (Apagar do banco) -> É uma remoção real
router.delete('/:id', productController.deleteProduct);

module.exports = router;
