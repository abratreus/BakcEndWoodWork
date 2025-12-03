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
  
  // 7. Salvar Token de Recuperação (Unificado)
  saveResetToken: async (id, token, expires) => {
    // Usando as colunas padrão do final do seu schema
    const sql = 'UPDATE usuarios SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?';
    const [result] = await db.execute(sql, [token, expires, id]);
    return result;
  },

  // 8. Buscar por Token de Recuperação
  getByResetToken: async (token) => {
    const sql = 'SELECT * FROM usuarios WHERE reset_password_token = ? AND reset_password_expires > NOW()';
    const [rows] = await db.execute(sql, [token]);
    return rows[0];
  },

  // 9. Limpar Token após uso
  clearResetToken: async (id) => {
    const sql = 'UPDATE usuarios SET reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?';
    const [result] = await db.execute(sql, [id]);
    return result;
  }
}; // Fim do objeto UsuarioModel

module.exports = UsuarioModel;