const db = require('../config/db');

const EnderecoModel = {
  // 1. Listar todos (Geral - uso administrativo)
  getAll: async () => {
    const query = 'SELECT * FROM enderecos';
    const [rows] = await db.query(query);
    return rows;
  },

  // 1.1 Listar por Usuário (Muito comum para carregar "Meus Endereços")
  getByUserId: async (usuarioId) => {
    const query = 'SELECT * FROM enderecos WHERE usuario_id = ?';
    const [rows] = await db.query(query, [usuarioId]);
    return rows;
  },

  // 2. Buscar por ID
  getById: async (id) => {
    const query = 'SELECT * FROM enderecos WHERE id = ?';
    const [rows] = await db.query(query, [id]);
    return rows[0];
  },

  // 3. Criar Endereço
  create: async (data) => {
    const query = `
      INSERT INTO enderecos (
        usuario_id, logradouro, numero, complemento, 
        bairro, cidade, estado, cep, tipo_endereco
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      data.usuario_id,
      data.logradouro,
      data.numero,
      data.complemento || null,
      data.bairro || null,
      data.cidade,
      data.estado,
      data.cep,
      data.tipo_endereco || 'entrega' // Default do banco
    ];

    const [result] = await db.query(query, values);
    return { id: result.insertId, ...data };
  },

  // 4. Atualizar Endereço
  update: async (id, data) => {
    const query = `
      UPDATE enderecos 
      SET logradouro = ?, numero = ?, complemento = ?, 
          bairro = ?, cidade = ?, estado = ?, cep = ?, tipo_endereco = ?
      WHERE id = ?
    `;
    
    const values = [
      data.logradouro,
      data.numero,
      data.complemento,
      data.bairro,
      data.cidade,
      data.estado,
      data.cep,
      data.tipo_endereco,
      id
    ];

    const [result] = await db.query(query, values);
    return result;
  },

  // 5. Deletar (Fisicamente, pois não há campo 'ativo' na tabela)
  delete: async (id) => {
    const query = 'DELETE FROM enderecos WHERE id = ?';
    const [result] = await db.query(query, [id]);
    return result;
  }
};

module.exports = EnderecoModel;