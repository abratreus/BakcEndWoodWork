// seedAdmin.js
require('dotenv').config(); // Carrega variáveis de ambiente
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

// Configuração do Banco de Dados
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'sua_senha_mysql',
    database: process.env.DB_NAME || 'nome_do_seu_banco'
};

// Adicione isso para testar (remova depois, pois expõe a senha no terminal)
console.log('Senha lida do .env:', process.env.DB_PASS); 
console.log('Senha sendo usada:', process.env.DB_PASS || 'sua_senha_mysql');

// Dados do Admin que será criado
const novoAdmin = {
    nome: 'Administrador Principal',
    email: 'admin@sistema.com',
    senhaPlana: 'SenhaForte123!', // A senha que você vai digitar no login
    role: 'admin' // Ou o campo que você usa para diferenciar (ex: is_admin = 1)
};

async function criarAdmin() {
    let connection;
    try {
        // 1. Criar conexão
        console.log('🔌 Conectando ao banco de dados...');
        connection = await mysql.createConnection(dbConfig);

        // 2. Verificar se o admin já existe para evitar duplicidade
        const [rows] = await connection.execute(
            'SELECT * FROM usuarios WHERE email = ?', 
            [novoAdmin.email]
        );

        if (rows.length > 0) {
            console.log('⚠  Atenção: Já existe um usuário com este e-mail.');
            return;
        }

        // 3. Gerar o Hash da senha (Criptografia)
        console.log('🔒 Gerando hash da senha...');
        const saltRounds = 10;
        const hash = await bcrypt.hash(novoAdmin.senhaPlana, saltRounds);

        // 4. Inserir no banco
        // IMPORTANTE: Ajuste os nomes das colunas (nome, email, senha, perfil) 
        // conforme a sua tabela real no MySQL.
        const sql = `
            INSERT INTO usuarios (nome_completo, email, senha_hash, tipo_perfil) 
            VALUES (?, ?, ?, ?)
        `;

        await connection.execute(sql, [
            novoAdmin.nome, 
            novoAdmin.email, 
            hash, 
            novoAdmin.role
        ]);

        console.log('✅ Admin criado com sucesso!');
        console.log('📧 Login: ${novoAdmin.email}');
        console.log('🔑 Senha: ${novoAdmin.senhaPlana}');

    } catch (error) {
        console.error('❌ Erro ao criar admin:', error);
    } finally {
        if (connection) await connection.end(); // Fecha a conexão
    }
}

criarAdmin();