require('dotenv').config();
const UsuarioModel = require('../models/usuarioModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_super_secreta';

const AuthController = {

  // === NOVO: AUTO-CADASTRO (CLIENTE) ===
  register: async (req, res) => {
    const { nome_completo, email, senha } = req.body;

    // Validação
    if (!nome_completo || !email || !senha) {
      return res.status(400).json({ error: 'Preencha todos os campos.' });
    }

    try {
      const userExists = await UsuarioModel.getByEmail(email);
      if (userExists) return res.status(409).json({ error: 'E-mail já cadastrado.' });

      const saltRounds = 10;
      const senha_hash = await bcrypt.hash(senha, saltRounds);

      // FORÇA O PERFIL CLIENTE (Segurança)
      const newUser = await UsuarioModel.create({
        nome_completo,
        email,
        senha_hash,
        tipo_perfil: 'cliente', 
        ativo: 1
      });

      return res.status(201).json({ message: 'Cadastro realizado com sucesso! Faça login.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao registrar usuário.' });
    }
  },

  // === LOGIN (Com Lógica de Redirecionamento) ===
  login: async (req, res) => {
    // O frontend pode enviar uma 'originUrl' (onde o cliente estava antes)
    const { email, senha, originUrl } = req.body; 

    try {
      const user = await UsuarioModel.getByEmail(email);
      if (!user) return res.status(401).json({ message: 'Credenciais inválidas' });
      if (!user.ativo) return res.status(403).json({ message: 'Usuário inativo.' });

      const senhaCorreta = await bcrypt.compare(senha, user.senha_hash);
      if (!senhaCorreta) return res.status(401).json({ message: 'Credenciais inválidas' });

      const token = jwt.sign(
        { id: user.id, perfil: user.tipo_perfil },
        JWT_SECRET,
        { expiresIn: '2h' }
      );

      // === LÓGICA DE REDIRECIONAMENTO ===
      let redirectUrl = '/home'; // Padrão

      if (user.tipo_perfil === 'admin') {
        // Admin SEMPRE vai para o painel
        redirectUrl = '/admin';
      } else {
        // Cliente vai para onde estava OU para home/catalogo
        redirectUrl = originUrl || '/catalogo';
      }

      res.json({
        message: 'Login realizado',
        token,
        redirectUrl, // O Frontend deve ler isso e fazer o window.location = redirectUrl
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

  // ... (Mantenha forgotPassword e resetPassword como estão)
  forgotPassword: async (req, res) => { 
      // ... seu código existente ...
  },
  
  resetPassword: async (req, res) => {
      // ... seu código existente ...
  }
};

module.exports = AuthController;