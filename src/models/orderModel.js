const db = require('../config/db');

const OrderModel = {
    createOrder: async (usuarioId, itens) => {
        const connection = await db.getConnection(); // Pega conexão exclusiva para transação
        try {
            await connection.beginTransaction();

            // 1. Calcula o total (em um cenário real, busque o preço do banco, não do front-end)
            const total = itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);

            // 2. Cria o Pedido
            const [orderResult] = await connection.query(
                'INSERT INTO pedidos (usuario_id, total) VALUES (?, ?)',
                [usuarioId, total]
            );
            const orderId = orderResult.insertId;

            // 3. Insere os Itens do Pedido
            for (const item of itens) {
                await connection.query(
                    'INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
                    [orderId, item.produto_id, item.quantidade, item.preco]
                );
                
                // Opcional: Atualizar estoque aqui
                await connection.query(
                    'UPDATE produtos SET estoque = estoque - ? WHERE id = ?',
                    [item.quantidade, item.produto_id]
                );
            }

            await connection.commit();
            return { orderId, total, status: 'pendente' };

        } catch (error) {
            await connection.rollback(); // Desfaz tudo se der erro
            throw error;
        } finally {
            connection.release(); // Devolve a conexão para o pool
        }
    }
};

module.exports = OrderModel;