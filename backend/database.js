const { Pool } = require('pg');

// Configurações de conexão usando as variáveis de ambiente do docker-compose
const pool = new Pool({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'user_clinica',
    password: process.env.DB_PASSWORD || 'password_clinica',
    database: process.env.DB_NAME || 'clinica_db',
    port: process.env.DB_PORT || 5432,
});

// Teste de conexão inicial e criação da tabela se não existir
const inicializarBanco = async () => {
    try {
        const client = await pool.connect();
        console.log(">>> [STI] Conectado ao PostgreSQL com sucesso.");
        
        // Criação da tabela com a coluna 'status' e 'data_cadastro'
        await client.query(`
            CREATE TABLE IF NOT EXISTS clientes (
                id SERIAL PRIMARY KEY,
                nome_completo TEXT NOT NULL,
                telefone TEXT,
                email TEXT,
                mensagem TEXT,
                status TEXT DEFAULT 'Pendente',
                data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        client.release();
    } catch (err) {
        console.error("X [STI] Erro ao conectar ou inicializar o banco:", err.message);
    }
};

inicializarBanco();

module.exports = {
    query: (text, params) => pool.query(text, params),
};