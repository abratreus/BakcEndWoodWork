const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // Segurança (headers HTTP)

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
//const orderRoutes = require('./routes/orderRoutes');
const enderecoRoutes = require('./routes/enderecoRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes.js');
const imagemRoutes = require('./routes/imagemRoutes');
const path = require('path');
// const orcamentoRoutes = require('./routes/orcamentoRoutes');


const app = express();

// Middlewares Globais
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:5174', 'http://localhost:5173'], // Use COLCHETES para lista
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Rotas
app.use('/auth', authRoutes);
app.use('/api/produtos', productRoutes);
app.use('/api/usuarios', usuarioRoutes);
//app.use('/api/pedidos', orderRoutes);
//app.use('/api/pedidos', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/enderecos', enderecoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/imagens', imagemRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use('/api/orcamentos', orcamentoRoutes); 

// Rota padrão para 404
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint não encontrado' });
});

module.exports = app;
