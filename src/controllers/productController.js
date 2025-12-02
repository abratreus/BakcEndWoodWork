const ProductModel = require('../models/productModel');

const ProductController = {

  // 1. getProducts (Listar todos)
  getProducts: async (req, res) => {
    try {
      const products = await ProductModel.getAll();
      return res.status(200).json(products);
    } catch (error) {
      console.error('Erro em getProducts:', error);
      return res.status(500).json({ error: 'Erro ao buscar produtos.' });
    }
  },

  // 2. getProduct (Buscar Detalhado com Imagens)
  getProduct: async (req, res) => {
    const { id } = req.params;
    try {
      const product = await ProductModel.getById(id);
      
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }

      return res.status(200).json(product);
    } catch (error) {
      console.error('Erro em getProduct:', error);
      return res.status(500).json({ error: 'Erro ao buscar detalhes do produto.' });
    }
  },

  // 3. createProduct (CORRIGIDO PARA MÚLTIPLAS IMAGENS)
  createProduct: async (req, res) => {
    try {
      // Extrai dados do corpo
      const { nome, descricao_detalhada, preco_atual, categoria_id, qtd_estoque } = req.body;

      // Extrai caminhos das imagens (req.files é um array agora)
      const imagensPaths = req.files ? req.files.map(file => file.path) : [];

      // Validação básica
      if (!nome || !preco_atual) {
        return res.status(400).json({ message: 'Nome e Preço são obrigatórios.' });
      }

      // Chama o Model passando os dados do produto E o array de imagens
      const newId = await ProductModel.create(
        { nome, descricao_detalhada, preco_atual, categoria_id, qtd_estoque },
        imagensPaths
      );

      res.status(201).json({ 
        message: 'Produto criado com sucesso!', 
        id: newId, 
        imagens: imagensPaths 
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao cadastrar produto.' });
    }
  },

  // 4. updateProduct (CORRIGIDO)
  updateProduct: async (req, res) => {
    const { id } = req.params;
    
    try {
      const existingProduct = await ProductModel.getById(id);
      if (!existingProduct) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }

      // Se enviou novas imagens, prepara o array
      const novasImagens = req.files ? req.files.map(file => file.path) : [];

      // Atualiza texto
      await ProductModel.update(id, req.body);

      // Adiciona novas imagens se houver
      if (novasImagens.length > 0) {
        await ProductModel.addImages(id, novasImagens);
      }

      return res.status(200).json({ message: 'Produto atualizado!', id });
    } catch (error) {
      console.error('Erro em updateProduct:', error);
      return res.status(500).json({ error: 'Erro ao atualizar produto.' });
    }
  },

  // ... (deleteProduct e softDeleteProduct podem ficar iguais ao original) ...
  deleteProduct: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await ProductModel.delete(id);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Produto não encontrado.' });
      return res.status(200).json({ message: 'Produto removido com sucesso.' });
    } catch (error) {
      if (error.code === 'ER_ROW_IS_REFERENCED_2') return res.status(409).json({ error: 'Produto possui vendas.' });
      return res.status(500).json({ error: 'Erro ao deletar produto.' });
    }
  },

  softDeleteProduct: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await ProductModel.softDelete(id); 
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Produto não encontrado.' });
      return res.status(200).json({ message: 'Produto inativado com sucesso.' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao inativar produto.' });
    }
  },

  activateProduct: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await ProductModel.activateProduct(id); 
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Produto não encontrado.' });
      return res.status(200).json({ message: 'Produto ativado com sucesso.' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao ativar produto.' });
    }
  }

};

module.exports = ProductController;