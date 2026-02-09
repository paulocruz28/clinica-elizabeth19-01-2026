/**
 * [STI] Servidor Backend - Clínica Elizabeth Cruz
 * Versão: 2.9 - UNIFICAÇÃO TOTAL (Logs Avançados + Gestão de Equipe + Sincronia Google)
 * Mantém integridade total de funções, timeouts e lógica de segurança.
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const express = require('express');
const cors = require('cors'); 
const path = require('path');
const db = require('./database'); 

const app = express();

// [STI] Configuração de CORS Ultra-Segura para Deploy (Render)
// Permite que o frontend acesse o backend sem bloqueios de segurança
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true
})); 

app.options('*', cors());
app.use(express.json());

// Servindo arquivos estáticos do frontend (Necessário para o Render ler o index.html)
app.use(express.static(path.join(__dirname, '../frontend')));

const GOOGLE_URL = "https://script.google.com/macros/s/AKfycbzW943XeOeG9MJNf7Mf5XDxb5w6E0jo12A-AAdZsH-YLhTVWkZ5ZEv1DRxZ5QsUKTv3-w/exec";

// ==========================================
// SEÇÃO A: GESTÃO DE CLIENTES (INTEGRIDADE STI)
// ==========================================



// ROTA: Salvar Contato (Postgres + Google)
app.post('/api/salvar-contato', async (req, res) => {
    const { nome, telefone, mensagem, email, cpf, queixa } = req.body; 
    console.log(`>>> [STI] [NOVO CONTATO] Recebendo agendamento: ${nome}`);

    try {
        // 1. Salva no Postgres local/nuvem (8 campos garantidos)
        const sql = `INSERT INTO clientes (nome_completo, telefone, email, mensagem, cpf, queixa, status, funcionario_resp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
        await db.query(sql, [
            nome || 'Sem Nome', 
            telefone || '---', 
            email || 'nao@informado.com', 
            mensagem || '', 
            cpf || '---', 
            queixa || 'Geral', 
            'Pendente', 
            'Não Atribuído'
        ]);
        
        // 2. Sincronização em segundo plano com timeout de segurança (10s)
        fetch(GOOGLE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, telefone, mensagem, email, cpf, queixa }),
            redirect: 'follow',
            signal: AbortSignal.timeout(10000) 
        }).then(() => console.log(`>>> [STI] [GOOGLE] Dados de ${nome} sincronizados com sucesso.`))
          .catch(e => console.error(`X [STI] [GOOGLE] Erro na sincronia de ${nome}:`, e.message));

        res.status(200).json({ success: true });
    } catch (err) {
        console.error("X [STI] [DB ERROR] Falha ao salvar contato:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ROTA: Listar Pacientes para o Admin
app.get('/api/listar-contatos', async (req, res) => {
    try {
        console.log(">>> [STI] [ADMIN] Solicitando lista de contatos...");
        const resultado = await db.query('SELECT * FROM clientes ORDER BY id DESC');
        res.json(resultado.rows);
    } catch (err) { 
        console.error("X [STI] [DB ERROR] Falha ao listar contatos:", err.message);
        res.status(500).json([]); 
    }
});

// ROTA: Atualizar Status (Pendente/Atendido/Cancelado)
app.patch('/api/atualizar-status/:id', async (req, res) => {
    const { id } = req.params; const { status } = req.body;
    try {
        await db.query('UPDATE clientes SET status = $1 WHERE id = $2', [status, id]);
        console.log(`>>> [STI] [STATUS] ID ${id} atualizado para: ${status}`);
        res.json({ success: true });
    } catch (err) {
        console.error("X [STI] [DB ERROR] Falha ao atualizar status:", err.message);
        res.status(500).json({ success: false });
    }
});

// ROTA: Excluir Contato Localmente
app.delete('/api/excluir-contato/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM clientes WHERE id = $1', [id]);
        console.log(`>>> [STI] [DELETE] Cliente ID ${id} removido do banco local.`);
        res.json({ success: true });
    } catch (err) {
        console.error("X [STI] [DB ERROR] Falha ao excluir contato:", err.message);
        res.status(500).json({ success: false });
    }
});

// ==========================================
// SEÇÃO B: GESTÃO DE EQUIPE (RASTREABILIDADE)
// ==========================================

// ROTA: Listar Funcionários Cadastrados
app.get('/api/funcionarios', async (req, res) => {
    try {
        console.log(">>> [STI] [ADMIN] Sincronizando lista de funcionários...");
        const resultado = await db.query('SELECT * FROM funcionarios ORDER BY nome ASC');
        res.json(resultado.rows);
    } catch (err) { 
        console.error("X [STI] [DB ERROR] Falha ao listar equipe:", err.message);
        res.status(500).json([]); 
    }
});

// ROTA: Adicionar Novo Profissional
app.post('/api/funcionarios', async (req, res) => {
    const { nome, cargo } = req.body;
    try {
        await db.query('INSERT INTO funcionarios (nome, cargo) VALUES ($1, $2)', [nome, cargo]);
        console.log(`>>> [STI] [EQUIPE] Novo profissional cadastrado: ${nome} (${cargo})`);
        res.json({ success: true });
    } catch (err) { 
        console.error("X [STI] [DB ERROR] Falha ao cadastrar funcionário:", err.message);
        res.status(500).json({ success: false }); 
    }
});

// ROTA: Remover Profissional da Equipe
app.delete('/api/funcionarios/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM funcionarios WHERE id = $1', [id]);
        console.log(`>>> [STI] [EQUIPE] Funcionário ID ${id} removido do sistema.`);
        res.json({ success: true });
    } catch (err) { 
        console.error("X [STI] [DB ERROR] Falha ao remover funcionário:", err.message);
        res.status(500).json({ success: false }); 
    }
});

// ROTA: Vincular Profissional ao Paciente
app.patch('/api/vincular-funcionario/:id', async (req, res) => {
    const { id } = req.params; const { funcionario } = req.body;
    try {
        await db.query('UPDATE clientes SET funcionario_resp = $1 WHERE id = $2', [funcionario, id]);
        console.log(`>>> [STI] [VINCULO] Paciente ID ${id} atribuído ao profissional: ${funcionario}`);
        res.json({ success: true });
    } catch (err) {
        console.error("X [STI] [DB ERROR] Falha ao vincular profissional:", err.message);
        res.status(500).json({ success: false });
    }
});

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`>>> [STI] BACKEND ATIVO NA PORTA ${PORT}`);
    console.log(`>>> [STI] MODO: ${process.env.DATABASE_URL ? 'NUVEM (RENDER)' : 'LOCAL/DOCKER'}`);
    console.log(`=========================================`);
});