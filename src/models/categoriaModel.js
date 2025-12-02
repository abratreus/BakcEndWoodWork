const db = require('../config/db');

const CategoriaModel = {
  // 1. Listar todas 
  getAll: async () => {
    // Selecionamos tudo, EXCETO a senha por segurança
    const query = 'SELECT id, nome, descricao, ativa FROM categorias';
    const [rows] = await db.query(query);
    return rows;
  },

  // 2. Buscar por ID
  getById: async (id) => {
    const query = 'SELECT id, nome, descricao, ativa FROM categorias WHERE id = ?';
    const [rows] = await db.query(query, [id]);
    return rows[0];
  },

  
  // 3. Criar Categoria
  create: async (data) => {
    const query = `
      INSERT INTO categorias (nome, descricao)
      VALUES (?, ?)
    `;    

    const values = [
      data.categoria_id,
      data.nome,
      data.descricao,
      data.ativa !== undefined ? data.ativa: 1 // Default 1 (True) se não vier
    ];

    const [result] = await db.query(query, values);
    return { id: result.insertId, ...data };
  },

  // 4. Atualizar Categoria
  update: async (id, data) => {
    const query = `
      UPDATE categorias 
      SET nome = ?, descricao = ?, ativa = ?
      WHERE id = ?
    `;
    const values = [data.nome, data.descricao, data.ativa, id];
    const [result] = await db.query(query, values);
    return result;
  },
  
  // 5. Deletar (Fisicamente)
  delete: async (id) => {
    const query = 'DELETE FROM categorias WHERE id = ?';
    const [result] = await db.query(query, [id]);
    return result;
},

  // 6. Soft Delete (Inativar)
  softDelete: async (id) => {
    const query = 'UPDATE categorias SET ativa = 0 WHERE id = ?';
    const [result] = await db.query(query, [id]);
    return result;
  }

};

module.exports = CategoriaModel;