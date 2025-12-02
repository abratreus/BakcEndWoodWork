require('dotenv').config();

const UsuarioModel = require('../models/usuarioModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Configuração simples do JWT (O ideal é estar no .env)
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_super_secreta';

const AuthController = {

  // === LOGIN ===
  login: async (req, res) => {
    const { email, senha } = req.body;

    try {
      // 1. Verificar se usuário existe
      const user = await UsuarioModel.getByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'E-mail ou senha inválidos' });
      }

      // 2. Verificar se está ativo
      if (!user.ativo) {
        return res.status(403).json({ message: 'Usuário inativo.' });
      }

      // 3. Comparar Senhas (Senha digitada vs Hash no Banco)
      const senhaCorreta = await bcrypt.compare(senha, user.senha_hash);
      if (!senhaCorreta) {
        return res.status(401).json({ message: 'E-mail ou senha inválidos' });
      }

      // 4. Gerar Token JWT
      const token = jwt.sign(
        { id: user.id, perfil: user.tipo_perfil }, // Payload
        JWT_SECRET,
        { expiresIn: '2h' } // Validade
      );

      // 5. Retornar sucesso (sem a senha!)
      res.json({
        message: 'Login realizado com sucesso',
        token,
        user: {
          id: user.id,
          nome: user.nome_completo,
          email: user.email,
          perfil: user.tipo_perfil
        }
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro no servidor' });
    }
  },

  // === ESQUECI A SENHA (Solicitar) ===
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
  },

  // === REDEFINIR SENHA (Confirmar troca) ===
  resetPassword: async (req, res) => {
    const { token } = req.params;
    const { novaSenha } = req.body;

    try {
      // 1. Buscar usuário pelo token e verificar validade
      const user = await UsuarioModel.getByResetToken(token);

      if (!user) {
        return res.status(400).json({ message: 'Token inválido ou expirado.' });
      }

      // 2. Criptografar nova senha
      const salt = await bcrypt.genSalt(10);
      const novaSenhaHash = await bcrypt.hash(novaSenha, salt);

      // 3. Atualizar senha no banco
      await UsuarioModel.updatePassword(user.id, novaSenhaHash);

      // 4. Limpar o token usado
      await UsuarioModel.clearResetToken(user.id);

      res.json({ message: 'Senha alterada com sucesso! Faça login.' });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao redefinir senha' });
    }
  }
};

module.exports = AuthController;