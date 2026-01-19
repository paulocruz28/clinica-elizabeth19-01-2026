const { Pool } = require('pg');

const pool = new Pool({
  user: 'admin_clinica',
  host: 'banco_dados', 
  database: 'sistema_clinica',
  password: 'senha_secreta_123',
  port: 5432,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Erro ao conectar ao banco de dados:', err.stack);
  }
  console.log('Conexão com o Banco de Dados PostgreSQL estabelecida com sucesso!');
  release();
});

module.exports = pool;