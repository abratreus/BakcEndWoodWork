const db = require('../config/db');

const ImagemProdutoModel = {
  // 1. Listar todas (Uso administrativo/geral)
  getAll: async () => {
    const query = 'SELECT * FROM imagens_produtos';
    const [rows] = await db.query(query);
    return rows;
  },

  // 1.1 Listar por Produto (Ordenado pela ordem de exibição)
  getByProductId: async (produtoId) => {
    const query = 'SELECT * FROM imagens_produtos WHERE produto_id = ? ORDER BY ordem_exibicao ASC';
    const [rows] = await db.query(query, [produtoId]);
    return rows;
  },

  // 2. Buscar por ID (Uma imagem específica)
  getById: async (id) => {
    const query = 'SELECT * FROM imagens_produtos WHERE id = ?';
    const [rows] = await db.query(query, [id]);
    return rows[0];
  },

  // 3. Criar Imagem
  create: async (data) => {
    const query = `
      INSERT INTO imagens_produtos (produto_id, url_imagem, ordem_exibicao)
      VALUES (?, ?, ?)
    `;

    const values = [
      data.produto_id,
      data.url_imagem,
      data.ordem_exibicao !== undefined ? data.ordem_exibicao : 0 // Default 0
    ];

    const [result] = await db.query(query, values);
    return { id: result.insertId, ...data };
  },

  // 4. Atualizar Imagem
  update: async (id, data) => {
    const query = `
      UPDATE imagens_produtos 
      SET produto_id = ?, url_imagem = ?, ordem_exibicao = ?
      WHERE id = ?
    `;
    
    const values = [
      data.produto_id,
      data.url_imagem,
      data.ordem_exibicao,
      id
    ];

    const [result] = await db.query(query, values);
    return result;
  },

  // 5. Deletar (Fisicamente)
  delete: async (id) => {
    const query = 'DELETE FROM imagens_produtos WHERE id = ?';
    const [result] = await db.query(query, [id]);
    return result;
  }
};

module.exports = ImagemProdutoModel;