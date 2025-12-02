require('dotenv').config();

const UsuarioModel = require('../models/usuarioModel');
const bcrypt = require('bcrypt'); // Importante!

const UsuarioController = {

  // GET /usuarios
  getUsers: async (req, res) => {
    try {
      const users = await UsuarioModel.getAll();
      return res.status(200).json(users);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar usuários.' });
    }
  },

  // GET /usuarios/:id
  getUser: async (req, res) => {
    const { id } = req.params;
    try {
      const user = await UsuarioModel.getById(id);
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
      return res.status(200).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao buscar usuário.' });
    }
  },

  // POST /usuarios (Cadastro)
  createUser: async (req, res) => {
    const { nome_completo, email, senha, tipo_perfil } = req.body;

    // Validação Básica
    if (!nome_completo || !email || !senha) {
      return res.status(400).json({ error: 'Preencha nome, email e senha.' });
    }

    try {
      // 1. Verifica se email já existe
      const userExists = await UsuarioModel.getByEmail(email);
      if (userExists) {
        return res.status(409).json({ error: 'E-mail já cadastrado.' });
      }

      // 2. Criptografa a senha (Hash)
      const saltRounds = 10;
      const senha_hash = await bcrypt.hash(senha, saltRounds);

      // 3. Cria o usuário
      const newUser = await UsuarioModel.create({
        nome_completo,
        email,
        senha_hash,
        tipo_perfil,
        ativo: 1
      });

      // Remove a senha do retorno para segurança
      delete newUser.senha_hash;

      return res.status(201).json({ message: 'Usuário criado com sucesso!', user: newUser });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao criar usuário.' });
    }
  },

  // PUT /usuarios/:id
  updateUser: async (req, res) => {
    const { id } = req.params;
    const { nome_completo, email, tipo_perfil, senha, ativo } = req.body;

    try {
      const existingUser = await UsuarioModel.getById(id);
      if (!existingUser) return res.status(404).json({ error: 'Usuário não encontrado.' });

      // Atualiza dados básicos
      // Mantém os antigos se não vierem novos (Lógica de merge)
      const dataToUpdate = {
        nome_completo: nome_completo || existingUser.nome_completo,
        email: email || existingUser.email,
        tipo_perfil: tipo_perfil || existingUser.tipo_perfil,
        ativo: (ativo !== undefined) ? ativo : existingUser.ativo
      };

      await UsuarioModel.update(id, dataToUpdate);

      // Se o usuário mandou uma NOVA SENHA, atualizamos o hash separadamente
      if (senha) {
        const saltRounds = 10;
        const novoHash = await bcrypt.hash(senha, saltRounds);
        await UsuarioModel.updatePassword(id, novoHash);
      }

      return res.status(200).json({ message: 'Usuário atualizado com sucesso!' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao atualizar usuário.' });
    }
  },

  // DELETE /usuarios/:id (Soft Delete)
  deleteUser: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await UsuarioModel.softDelete(id);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });

      return res.status(200).json({ message: 'Usuário inativado.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao remover usuário.' });
    }
  },

  // === ESQUECI A SENHA (Solicitar) ===
  forgotPassword: async (req, res) => {
    const { email } = req.body;

    try {
      // 1. Verificar se usuário existe
      const user = await UsuarioModel.getByEmail(email);
      
      if (!user) {
        // SEGURANÇA: Retornamos OK mesmo se o usuário não existir.
        // Isso impede que hackers descubram quais e-mails estão cadastrados na sua base.
        return res.status(200).json({ 
            message: 'Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.' 
        });
      }

      // 2. Gerar Token Aleatório (Hexadecimal)
      const token = crypto.randomBytes(20).toString('hex');
      
      // 3. Definir expiração (1 hora a partir de agora)
      const now = new Date();
      now.setHours(now.getHours() + 1);

      // 4. Salvar Token e Validade no Banco de Dados
      await UsuarioModel.saveResetToken(user.id, token, now);

      // 5. Configurar o Transporter (Lendo do .env)
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail', // Padrão 'gmail' se não houver no .env
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      // Define a URL base (Localhost em dev, domínio real em produção)
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

      const mailOptions = {
        to: user.email,
        from: process.env.EMAIL_USER, // O remetente deve ser o mesmo da autenticação
        subject: 'Recuperação de Senha - Sua App',
        text: `Olá, ${user.nome || 'Usuário'}.\n\n` +
              `Você solicitou a redefinição de sua senha.\n` +
              `Clique no link abaixo para criar uma nova senha:\n\n` +
              `${baseUrl}/reset-password/${token}\n\n` +
              `Este link expira em 1 hora.\n` +
              `Se você não solicitou isso, ignore este e-mail.`
      };

      // 6. Tentar Enviar o E-mail
      try {
        await transporter.sendMail(mailOptions);
        return res.json({ message: 'E-mail de recuperação enviado com sucesso!' });
      } catch (emailError) {
        console.error('Erro ao enviar e-mail:', emailError);
        // Opcional: Você pode querer desfazer a gravação do token no banco aqui se o e-mail falhar
        return res.status(500).json({ message: 'Erro ao enviar o e-mail. Tente novamente mais tarde.' });
      }

    } catch (error) {
      console.error('Erro no servidor (forgotPassword):', error);
      res.status(500).json({ message: 'Erro interno ao processar solicitação.' });
    }
  }
};

module.exports = UsuarioController;