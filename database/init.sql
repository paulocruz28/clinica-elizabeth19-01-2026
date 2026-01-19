-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nome_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Funcionários (Para a área restrita)
CREATE TABLE IF NOT EXISTS funcionarios (
    id SERIAL PRIMARY KEY,
    nome_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    cargo VARCHAR(50) NOT NULL -- Ex: 'Biomédica', 'Recepcionista'
);

-- Tabela de Agendamentos (Conecta Clientes e Funcionários)
CREATE TABLE IF NOT EXISTS agendamentos (
    id SERIAL PRIMARY KEY,
    cliente_id INT REFERENCES clientes(id),
    funcionario_id INT REFERENCES funcionarios(id),
    data_hora TIMESTAMP NOT NULL,
    procedimento VARCHAR(100) NOT NULL,
    observacoes TEXT,
    status VARCHAR(20) DEFAULT 'PENDENTE' -- PENDENTE, CONFIRMADO, CANCELADO
);

-- Inserindo um funcionário de teste (Login: admin / Senha: 123)
-- (Nota: Em produção a senha deve ser criptografada, isso é só teste)
INSERT INTO funcionarios (nome_completo, email, senha_hash, cargo) 
VALUES ('Elizabeth Cruz', 'admin@clinica.com', '123456', 'Dona');