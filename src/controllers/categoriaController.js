const CategoriaModel = require('../models/CategoriaModel');

const CategoriaController = {

  // 1. getCategories (Listar todas)
  getCategories: async (req, res) => {
    try {
      console.log('Controller: Buscando todas as categorias...');
      const categories = await CategoriaModel.getAll();
      return res.status(200).json(categories);
    } catch (error) {
      console.error('Erro em getCategories:', error);
      return res.status(500).json({ error: 'Erro ao buscar categorias.' });
    }
  },

  // 2. getCategory (Buscar uma categoria específica por ID)
  getCategory: async (req, res) => {
    const { id } = req.params;
    try {
      console.log(`Controller: Buscando categoria ID ${id}...`);
      const category = await CategoriaModel.getById(id);
      
      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada.' });
      }

      return res.status(200).json(category);
    } catch (error) {
      console.error('Erro em getCategory:', error);
      return res.status(500).json({ error: 'Erro ao buscar detalhes da categoria.' });
    }
  },

  // 3. createCategory (Criar uma categoria)
  createCategory: async (req, res) => {
    const { nome } = req.body;
    
    // Validação simples (Descricao pode ser opcional)
    if (!nome) {
      return res.status(400).json({ error: 'Campos obrigatórios: nome' });
    }

    try {
      console.log('Controller: Criando categoria...', nome);
      // Passamos o body inteiro, o Model cuida de pegar nome, descricao e ativa
      const newCategory = await CategoriaModel.create(req.body); 
      return res.status(201).json({ message: 'Categoria criada!', category: newCategory });
    } catch (error) {
      console.error('Erro em createCategory:', error);
      return res.status(500).json({ error: 'Erro ao criar categoria.' });
    }
  },

  // 4. updateCategory (Atualizar uma categoria)
  updateCategory: async (req, res) => {
    const { id } = req.params;
    
    try {
      // Verifica se existe antes de atualizar
      const existingCategory = await CategoriaModel.getById(id);
      if (!existingCategory) {
        return res.status(404).json({ error: 'Categoria não encontrada.' });
      }

      // Mantém os dados antigos se não vierem novos no body
      const updateData = { ...existingCategory, ...req.body };
      
      await CategoriaModel.update(id, updateData);
      return res.status(200).json({ message: 'Categoria atualizada!', id });
    } catch (error) {
      console.error('Erro em updateCategory:', error);
      return res.status(500).json({ error: 'Erro ao atualizar categoria.' });
    }
  },

  // 5. deleteCategory (Deletar uma categoria)
  deleteCategory: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await CategoriaModel.delete(id);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Categoria não encontrada.' });
      }

      return res.status(200).json({ message: 'Categoria removida com sucesso.' });
    } catch (error) {
      // Tratamento para erro de Chave Estrangeira (se existem produtos nesta categoria)
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ error: 'Categoria possui produtos vinculados e não pode ser excluída. Tente inativá-la.' });
      }
      console.error('Erro em deleteCategory:', error);
      return res.status(500).json({ error: 'Erro ao deletar categoria.' });
    }
  },

  // 6. Soft Delete (Inativar categoria)
  softDeleteCategory: async (req, res) => {
    const { id } = req.params;
    try {
      console.log(`Controller: Realizando Soft Delete na Categoria ID ${id}...`);
      
      const result = await CategoriaModel.softDelete(id); 
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Categoria não encontrada.' });
      }

      return res.status(200).json({ message: 'Categoria inativada com sucesso.' });
    } catch (error) {
      console.error('Erro em softDeleteCategory:', error);
      return res.status(500).json({ error: 'Erro ao inativar categoria.' });
    }
  }
};

module.exports = CategoriaController;