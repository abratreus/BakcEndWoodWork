const ImagemProdutoModel = require('../models/imagemModel');

const ImagemProdutoController = {

  // 1. getAllImages (Listar todas as imagens do banco)
  getAllImages: async (req, res) => {
    try {
      console.log('Controller: Buscando todas as imagens do sistema...');
      const images = await ImagemProdutoModel.getAll();
      return res.status(200).json(images);
    } catch (error) {
      console.error('Erro em getAllImages:', error);
      return res.status(500).json({ error: 'Erro ao buscar imagens.' });
    }
  },

  // 1.1 getImagesByProduct (Listar imagens de um produto específico)
  getImagesByProduct: async (req, res) => {
    const { produtoId } = req.params;
    try {
      console.log(`Controller: Buscando imagens do produto ID ${produtoId}...`);
      const images = await ImagemProdutoModel.getByProductId(produtoId);
      return res.status(200).json(images);
    } catch (error) {
      console.error('Erro em getImagesByProduct:', error);
      return res.status(500).json({ error: 'Erro ao buscar imagens do produto.' });
    }
  },

  // 2. getImage (Buscar uma imagem específica por ID)
  getImage: async (req, res) => {
    const { id } = req.params;
    try {
      console.log(`Controller: Buscando imagem ID ${id}...`);
      const image = await ImagemProdutoModel.getById(id);
      
      if (!image) {
        return res.status(404).json({ error: 'Imagem não encontrada.' });
      }

      return res.status(200).json(image);
    } catch (error) {
      console.error('Erro em getImage:', error);
      return res.status(500).json({ error: 'Erro ao buscar detalhes da imagem.' });
    }
  },

  // 3. createImage (Vincular nova imagem a um produto)
  createImage: async (req, res) => {
    const { produto_id, url_imagem, ordem_exibicao } = req.body;
    
    // Validação
    if (!produto_id || !url_imagem) {
      return res.status(400).json({ error: 'Campos obrigatórios: produto_id, url_imagem' });
    }

    try {
      console.log('Controller: Criando imagem para produto...', produto_id);
      
      // Monta objeto garantindo ordem_exibicao
      const data = {
        produto_id,
        url_imagem,
        ordem_exibicao: ordem_exibicao || 0
      };

      const newImage = await ImagemProdutoModel.create(data);
      return res.status(201).json({ message: 'Imagem adicionada!', image: newImage });
    } catch (error) {
      console.error('Erro em createImage:', error);
      return res.status(500).json({ error: 'Erro ao criar imagem.' });
    }
  },

  // 4. updateImage (Atualizar URL ou Ordem de uma imagem)
  updateImage: async (req, res) => {
    const { id } = req.params;
    
    try {
      // Verifica existência
      const existingImage = await ImagemProdutoModel.getById(id);
      if (!existingImage) {
        return res.status(404).json({ error: 'Imagem não encontrada.' });
      }

      // Merge de dados
      const updateData = { ...existingImage, ...req.body };
      
      await ImagemProdutoModel.update(id, updateData);
      return res.status(200).json({ message: 'Imagem atualizada!', id });
    } catch (error) {
      console.error('Erro em updateImage:', error);
      return res.status(500).json({ error: 'Erro ao atualizar imagem.' });
    }
  },

  // 5. deleteImage (Remover imagem)
  deleteImage: async (req, res) => {
    const { id } = req.params;
    try {
      console.log(`Controller: Deletando imagem ID ${id}...`);
      const result = await ImagemProdutoModel.delete(id);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Imagem não encontrada.' });
      }

      return res.status(200).json({ message: 'Imagem removida com sucesso.' });
    } catch (error) {
      console.error('Erro em deleteImage:', error);
      return res.status(500).json({ error: 'Erro ao deletar imagem.' });
    }
  }
};

module.exports = ImagemProdutoController;