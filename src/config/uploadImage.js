//  Caminho: ('/src/config/uploadImage.js')
const multer = require('multer');
const path = require('path');

// Configuração de Armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Define a pasta onde os arquivos serão salvos
    // Certifique-se de criar a pasta 'uploads' na raiz do projeto!
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    // Define um nome único para evitar sobrescrita (Timestamp + Extensão)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'produto-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro de Arquivos (Opcional: Aceitar apenas imagens)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo inválido. Apenas JPEG, JPG e PNG são permitidos.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
  fileFilter: fileFilter
});

module.exports = upload;