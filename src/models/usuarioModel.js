const db = require('../config/db');

const UsuarioModel = {
  // 1. Listar todos (Geralmente uso exclusivo de Admin)
  getAll: async () => {
    // Selecionamos tudo, EXCETO a senha por segurança
    const query = 'SELECT id, nome_completo, email, tipo_perfil, data_cadastro, ativo FROM usuarios';
    const [rows] = await db.query(query);
    return rows;
  },

  // 2. Buscar por ID
  getById: async (id) => {
    const query = 'SELECT id, nome_completo, email, tipo_perfil, data_cadastro, ativo FROM usuarios WHERE id = ?';
    const [rows] = await db.query(query, [id]);
    return rows[0];
  },

  // 3. Buscar por Email (Essencial para Login e validação de duplicidade)
  getByEmail: async (email) => {
    // Aqui precisamos da senha para conferir no login
    const query = 'SELECT * FROM usuarios WHERE email = ?';
    const [rows] = await db.query(query, [email]);
    return rows[0];
  },

  // 4. Criar Usuário
  create: async (data) => {
    const query = `
      INSERT INTO usuarios (nome_completo, email, senha_hash, tipo_perfil)
      VALUES (?, ?, ?, ?)
    `;
    const values = [
      data.nome_completo,
      data.email,
      data.senha_hash, // O Controller deve mandar isso já criptografado
      data.tipo_perfil || 'cliente'
    ];
    const [result] = await db.query(query, values);
    return { id: result.insertId, ...data };
  },

  // 5. Atualizar Usuário
  update: async (id, data) => {
    const query = `
      UPDATE usuarios 
      SET nome_completo = ?, email = ?, tipo_perfil = ?, ativo = ?
      WHERE id = ?
    `;
    const values = [data.nome_completo, data.email, data.tipo_perfil, data.ativo, id];
    const [result] = await db.query(query, values);
    return result;
  },

  // 5.1 Atualizar Senha (Método separado é mais seguro)
  updatePassword: async (id, novaSenhaHash) => {
    const query = 'UPDATE usuarios SET senha_hash = ? WHERE id = ?';
    await db.query(query, [novaSenhaHash, id]);
  },

  // 6. Soft Delete (Inativar)
  softDelete: async (id) => {
    const query = 'UPDATE usuarios SET ativo = 0 WHERE id = ?';
    const [result] = await db.query(query, [id]);
    return result;
  },

  // ... métodos anteriores

  // 7. Salvar Token de Recuperação
  saveResetToken: async (id, token, expiration) => {
    const query = 'UPDATE usuarios SET token_recuperacao = ?, token_expiracao = ? WHERE id = ?';
    await db.query(query, [token, expiration, id]);
  },

  // 8. Buscar por Token de Recuperação (Verifica se token existe e não expirou)
  getByResetToken: async (token) => {
    const query = `
      SELECT * FROM usuarios 
      WHERE token_recuperacao = ? 
      AND token_expiracao > NOW()
    `;
    const [rows] = await db.query(query, [token]);
    return rows[0];
  },
  
  // 9. Limpar Token após uso
  clearResetToken: async (id) => {
      const query = 'UPDATE usuarios SET token_recuperacao = NULL, token_expiracao = NULL WHERE id = ?';
      await db.query(query, [id]);
  },

  // 10. Atualizar Senha (NECESSÁRIO para o reset funcionar)
  updatePassword: async (id, novaSenhaHash) => {
    const query = 'UPDATE usuarios SET senha_hash = ? WHERE id = ?';
    await db.query(query, [novaSenhaHash, id]);
  },

  // Adicione isso dentro do objeto UsuarioModel em models/usuarioModel.js

  // Salva o token e a data de expiração
  saveResetToken: async (id, token, expires) => {
    const sql = 'UPDATE usuarios SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?';
    const [result] = await db.execute(sql, [token, expires, id]);
    return result;
  },

  // Busca usuário pelo token E verifica se o token ainda é válido (data > agora)
  getByResetToken: async (token) => {
    const sql = 'SELECT * FROM usuarios WHERE reset_password_token = ? AND reset_password_expires > NOW()';
    const [rows] = await db.execute(sql, [token]);
    return rows[0]; // Retorna undefined se não achar ou tiver expirado
  },

  // Atualiza a senha
  updatePassword: async (id, novaSenhaHash) => {
    const sql = 'UPDATE usuarios SET senha_hash = ? WHERE id = ?';
    const [result] = await db.execute(sql, [novaSenhaHash, id]);
    return result;
  },

  // Limpa o token após o uso (segurança)
  clearResetToken: async (id) => {
    const sql = 'UPDATE usuarios SET reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?';
    const [result] = await db.execute(sql, [id]);
    return result;
  }
};

module.exports = UsuarioModel;