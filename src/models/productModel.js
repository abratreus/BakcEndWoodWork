const db = require('../config/db');

const ProductModel = {
  // 1. Listar todos (Traz produtos + imagem de capa)
  getAll: async () => {
    // Subquery para pegar apenas UMA imagem como capa
    const query = `
      SELECT p.*, c.nome as nome_categoria,
             (SELECT url_imagem FROM imagens_produtos WHERE produto_id = p.id LIMIT 1) as imagem_capa
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
    `;
    const [rows] = await db.query(query);
    return rows;
  },

  // 2. Buscar por ID (Traz produto + Array de todas as imagens)
  getById: async (id) => {
    // Parte 1: Dados do Produto
    const queryProd = `
      SELECT p.*, c.nome as nome_categoria 
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = ?
    `;
    const [rowsProd] = await db.query(queryProd, [id]);
    if (rowsProd.length === 0) return null;

    const produto = rowsProd[0];

    // Parte 2: Todas as imagens
    const queryImg = 'SELECT id, url_imagem, ordem_exibicao FROM imagens_produtos WHERE produto_id = ? ORDER BY ordem_exibicao ASC';
    const [rowsImg] = await db.query(queryImg, [id]);

    produto.imagens = rowsImg; // Anexa as imagens ao JSON
    return produto;
  },

  // 3. Criar (Transação: Produto + Imagens)
  create: async (data, imagensPaths) => {
    // ATENÇÃO: Se seu db.js não exporta pool, talvez precise de adjustments.
    // Assumindo mysql2 com promises:
    const connection = await db.getConnection(); 
    
    try {
      await connection.beginTransaction();

      // Inserir Produto
      const queryProd = `
        INSERT INTO produtos (categoria_id, nome, descricao_detalhada, preco_atual, qtd_estoque, destaque, ativo)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const valuesProd = [
        data.categoria_id, data.nome, data.descricao_detalhada, data.preco_atual, 
        data.qtd_estoque || 0, data.destaque || 0, 1
      ];
      
      const [resultProd] = await connection.query(queryProd, valuesProd);
      const produtoId = resultProd.insertId;

      // Inserir Imagens (Se houver)
      if (imagensPaths && imagensPaths.length > 0) {
        const queryImg = 'INSERT INTO imagens_produtos (produto_id, url_imagem) VALUES ?';
        // Formata para Bulk Insert: [[id, url], [id, url]]
        const valoresImg = imagensPaths.map(path => [produtoId, path]);
        await connection.query(queryImg, [valoresImg]);
      }

      await connection.commit();
      connection.release();
      return produtoId;

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  },

  // 4. Adicionar imagens (Usado no Update)
  addImages: async (produtoId, imagensPaths) => {
    if (!imagensPaths || imagensPaths.length === 0) return;
    const query = 'INSERT INTO imagens_produtos (produto_id, url_imagem) VALUES ?';
    const valores = imagensPaths.map(path => [produtoId, path]);
    await db.query(query, [valores]);
  },

  // 5. Atualizar Produto (Apenas texto)
  update: async (id, data) => {
    // Montar query dinâmica ou fixa com todos os campos
    const query = `
      UPDATE produtos 
      SET categoria_id = ?, nome = ?, descricao_detalhada = ?, 
          preco_atual = ?, qtd_estoque = ?, destaque = ?
      WHERE id = ?
    `;
    const values = [
       data.categoria_id, data.nome, data.descricao_detalhada, 
       data.preco_atual, data.qtd_estoque, data.destaque, id
    ];
    const [result] = await db.query(query, values);
    return result;
  },

  // Delete e SoftDelete permanecem iguais ao seu código original
  delete: async (id) => {
    const query = 'DELETE FROM produtos WHERE id = ?';
    const [result] = await db.query(query, [id]);
    return result;
  },

  softDelete: async (id) => {
    const query = 'UPDATE produtos SET ativo = 0 WHERE id = ?';
    const [result] = await db.query(query, [id]);
    return result;
  },
  activateProduct: async (id) => {
    const query = 'UPDATE produtos SET ativo = 1 WHERE id = ?';
    const [result] = await db.query(query, [id]);
    return result;
  }
};

module.exports = ProductModel;