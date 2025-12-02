// const OrderModel = require('../models/orderModel');

// exports.createOrder = async (req, res) => {
//     try {
//         const { usuario_id, itens } = req.body;
        
//         if (!itens || itens.length === 0) {
//             return res.status(400).json({ error: 'O carrinho está vazio.' });
//         }

//         const order = await OrderModel.createOrder(usuario_id, itens);
//         res.status(201).json({ message: 'Pedido realizado com sucesso', order });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Erro ao processar pedido' });
//     }
// };