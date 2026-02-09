const { Pool } = require('pg');
const isProduction = process.env.DATABASE_URL;

const dbConfig = isProduction 
    ? { 
        connectionString: process.env.DATABASE_URL, 
        ssl: { rejectUnauthorized: false } 
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'user_clinica',
        password: process.env.DB_PASSWORD || 'password_clinica',
        database: process.env.DB_NAME || 'clinica_db',
        port: process.env.DB_PORT || 5432,
      };

const pool = new Pool(dbConfig);

const inicializarBanco = async () => {
    try {
        const client = await pool.connect();
        console.log(`=========================================`);
        console.log(`>>> [STI] BANCO CONECTADO: ${isProduction ? 'NUVEM' : 'LOCAL'}`);
        
        // [STI] Tabela de Clientes Integrada
        await client.query(`
            CREATE TABLE IF NOT EXISTS clientes (
                id SERIAL PRIMARY KEY,
                nome_completo TEXT NOT NULL,
                cpf TEXT,
                telefone TEXT,
                email TEXT,
                queixa TEXT,
                mensagem TEXT,
                status TEXT DEFAULT 'Pendente',
                funcionario_resp TEXT DEFAULT 'Não Atribuído',
                data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // [STI] Tabela de Funcionários Integrada
        await client.query(`
            CREATE TABLE IF NOT EXISTS funcionarios (
                id SERIAL PRIMARY KEY,
                nome TEXT NOT NULL,
                cargo TEXT,
                data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log(">>> [STI] ESTRUTURAS 'CLIENTES' E 'FUNCIONARIOS' VERIFICADAS.");
        console.log(`=========================================`);
        client.release();
    } catch (err) {
        console.error("X [STI] ERRO NA INICIALIZAÇÃO DO BANCO:", err.message);
    }
};

inicializarBanco();
module.exports = { query: (text, params) => pool.query(text, params) };