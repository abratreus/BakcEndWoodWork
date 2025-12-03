// routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Importamos o middleware
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// === ROTAS PROTEGIDAS (ADMIN) ===

// Para listar todos os usuários, tem que estar logado E ser admin
router.get('/', verifyToken, isAdmin, usuarioController.getUsers);

// Para deletar usuário (soft delete), apenas admin
router.delete('/:id', verifyToken, isAdmin, usuarioController.deleteUser);


// === ROTAS MISTAS OU PÚBLICAS ===

// Criar usuário é público (Auto-cadastro) ou protegido?
// Se for o auto-cadastro do site, deve ser pública (como definimos no authController).
// Se for um admin criando outro usuário manualmente, usa a rota abaixo:
router.post('/', verifyToken, isAdmin, usuarioController.createUser); 

// === ROTA DE USUÁRIO COMUM ===

// O usuário pode ver o próprio perfil
router.get('/:id', verifyToken, (req, res) => {
    // Segurança extra: O ID da URL deve bater com o ID do token, 
    // a menos que quem esteja pedindo seja um admin.
    if (req.user.perfil === 'admin' || req.user.id == req.params.id) {
        return usuarioController.getUser(req, res);
    }
    return res.status(403).json({ message: 'Você não tem permissão para ver dados de outro usuário.' });
});

// O usuário pode atualizar o próprio perfil
router.put('/:id', verifyToken, (req, res) => {
    if (req.user.perfil === 'admin' || req.user.id == req.params.id) {
        return usuarioController.updateUser(req, res);
    }
    return res.status(403).json({ message: 'Você não pode alterar dados de outro usuário.' });
});

module.exports = router;