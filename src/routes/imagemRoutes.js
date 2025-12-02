const express = require('express');
const router = express.Router();
const ImagemProdutoController = require('../controllers/imagemProductController');

// --- Rotas de Imagens de Produtos ---

// 1. CRUD Básico (Acesso direto pelo ID da imagem)
router.get('/', ImagemProdutoController.getAllImages); // Listão geral
router.get('/:id', ImagemProdutoController.getImage);
router.post('/', ImagemProdutoController.createImage);
router.put('/:id', ImagemProdutoController.updateImage);
router.delete('/:id', ImagemProdutoController.deleteImage);

// 2. Rota aninhada (Recomendado para frontend: "Me dê as imagens do Produto 50")
router.get('/produtos/:produtoId/imagens', ImagemProdutoController.getImagesByProduct);

module.exports = router;