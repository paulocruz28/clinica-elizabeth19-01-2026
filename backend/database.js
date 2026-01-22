const { Pool } = require('pg');

/**
 * [STI] Configuração de Conexão Híbrida
 * Se houver uma DATABASE_URL (Nuvem/Render), usa ela.
 * Caso contrário, usa as configurações locais do Docker.
 */
const isProduction = process.env.DATABASE_URL;

const dbConfig = isProduction 
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Necessário para conexões seguras em nuvem
      }
    : {
        host: process.env.DB_HOST || 'db',
        user: process.env.DB_USER || 'user_clinica',
        password: process.env.DB_PASSWORD || 'password_clinica',
        database: process.env.DB_NAME || 'clinica_db',
        port: process.env.DB_PORT || 5432,
      };

const pool = new Pool(dbConfig);

const inicializarBanco = async () => {
    try {
        const client = await pool.connect();
        console.log(`>>> [STI] Conexão ativa: ${isProduction ? 'NUVEM (Render)' : 'LOCAL (Docker)'}`);
        
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
        console.error("X [STI] FALHA NA CONEXÃO COM O BANCO:", err.message);
    }
};

inicializarBanco();

module.exports = {
    query: (text, params) => pool.query(text, params),
};