const EnderecoModel = require('../models/EnderecoModel');

const EnderecoController = {

  // 1. getAddresses (Listar todos - Admin)
  getAddresses: async (req, res) => {
    try {
      console.log('Controller: Buscando todos os endereços...');
      const addresses = await EnderecoModel.getAll();
      return res.status(200).json(addresses);
    } catch (error) {
      console.error('Erro em getAddresses:', error);
      return res.status(500).json({ error: 'Erro ao buscar endereços.' });
    }
  },

  // 1.1 getAddressesByUser (Buscar endereços de um usuário específico)
  getAddressesByUser: async (req, res) => {
    const { usuarioId } = req.params;
    try {
      console.log(`Controller: Buscando endereços do usuário ID ${usuarioId}...`);
      const addresses = await EnderecoModel.getByUserId(usuarioId);
      return res.status(200).json(addresses);
    } catch (error) {
      console.error('Erro em getAddressesByUser:', error);
      return res.status(500).json({ error: 'Erro ao buscar endereços do usuário.' });
    }
  },

  // 2. getAddress (Buscar um endereço específico por ID)
  getAddress: async (req, res) => {
    const { id } = req.params;
    try {
      console.log(`Controller: Buscando endereço ID ${id}...`);
      const address = await EnderecoModel.getById(id);
      
      if (!address) {
        return res.status(404).json({ error: 'Endereço não encontrado.' });
      }

      return res.status(200).json(address);
    } catch (error) {
      console.error('Erro em getAddress:', error);
      return res.status(500).json({ error: 'Erro ao buscar detalhes do endereço.' });
    }
  },

  // 3. createAddress (Criar um endereço)
  createAddress: async (req, res) => {
    const { usuario_id, logradouro, numero, cidade, estado, cep } = req.body;
    
    // Validação dos campos NOT NULL do banco
    if (!usuario_id || !logradouro || !numero || !cidade || !estado || !cep) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: usuario_id, logradouro, numero, cidade, estado, cep' 
      });
    }

    try {
      console.log('Controller: Criando endereço para usuário...', usuario_id);
      const newAddress = await EnderecoModel.create(req.body);
      return res.status(201).json({ message: 'Endereço criado!', address: newAddress });
    } catch (error) {
      console.error('Erro em createAddress:', error);
      return res.status(500).json({ error: 'Erro ao criar endereço.' });
    }
  },

  // 4. updateAddress (Atualizar um endereço)
  updateAddress: async (req, res) => {
    const { id } = req.params;
    
    try {
      // Verifica se existe antes de atualizar
      const existingAddress = await EnderecoModel.getById(id);
      if (!existingAddress) {
        return res.status(404).json({ error: 'Endereço não encontrado.' });
      }

      // Merge dos dados antigos com os novos
      const updateData = { ...existingAddress, ...req.body };
      
      await EnderecoModel.update(id, updateData);
      return res.status(200).json({ message: 'Endereço atualizado!', id });
    } catch (error) {
      console.error('Erro em updateAddress:', error);
      return res.status(500).json({ error: 'Erro ao atualizar endereço.' });
    }
  },

  // 5. deleteAddress (Deletar um endereço)
  deleteAddress: async (req, res) => {
    const { id } = req.params;
    try {
      console.log(`Controller: Deletando endereço ID ${id}...`);
      const result = await EnderecoModel.delete(id);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Endereço não encontrado.' });
      }

      return res.status(200).json({ message: 'Endereço removido com sucesso.' });
    } catch (error) {
      console.error('Erro em deleteAddress:', error);
      return res.status(500).json({ error: 'Erro ao deletar endereço.' });
    }
  }
};

module.exports = EnderecoController;