// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET; // Deve ser a mesma chave do AuthController

const authMiddleware = {
    
    // 1. Verifica se o Token é válido (Usuário Logado)
    verifyToken: (req, res, next) => {
        const authHeader = req.headers['authorization'];
        
        // O token geralmente vem assim: "Bearer eyJhbGciOi..."
        // Precisamos separar o "Bearer" do código
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Acesso negado! Token não fornecido.' });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            
            // Adiciona os dados do usuário dentro da requisição (req)
            // Assim, o próximo passo (controller) sabe quem está acessando
            req.user = decoded; 

            next(); // Pode passar para a próxima etapa
        } catch (error) {
            return res.status(403).json({ message: 'Token inválido ou expirado.' });
        }
    },

    // 2. Verifica se é Admin (Só funciona se usado DEPOIS do verifyToken)
    isAdmin: (req, res, next) => {
        // O req.user foi preenchido na função anterior
        if (req.user && req.user.perfil === 'admin') {
            next(); // É admin, pode passar
        } else {
            return res.status(403).json({ message: 'Acesso restrito a administradores.' });
        }
    }
};

module.exports = authMiddleware;