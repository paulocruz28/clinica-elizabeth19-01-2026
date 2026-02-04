/**
 * [STI] Servidor Backend - Clínica Elizabeth Cruz
 * Versão: 2.2 - Ajustada para Deploy (Porta Dinâmica e CORS)
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const express = require('express');
const cors = require('cors'); 
const path = require('path');
const db = require('./database'); 

const app = express();

// [STI] Configuração de CORS robusta para permitir conexões externas
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
})); 

app.use(express.json());

// [STI] Servindo arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend')));

const GOOGLE_URL = "https://script.google.com/macros/s/AKfycbzW943XeOeG9MJNf7Mf5XDxb5w6E0jo12A-AAdZsH-YLhTVWkZ5ZEv1DRxZ5QsUKTv3-w/exec";

// ==========================================
// ROTA 1: Salvar Contato (Postgres + Google)
// ==========================================
app.post('/api/salvar-contato', async (req, res) => {
    const { nome, telefone, mensagem, email, cpf, queixa } = req.body; 
    console.log(`>>> [STI] Recebendo novo contato: ${nome}`);

    try {
        // 1. Salva no Postgres (Detecta automaticamente se é Local ou Render)
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
        
        // 2. Envia para o Google Sheets (Com Timeout de segurança)
        fetch(GOOGLE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, telefone, mensagem, email, cpf, queixa }),
            redirect: 'follow',
            signal: AbortSignal.timeout(10000) 
        }).then(() => {
            console.log(">>> [STI] Sincronizado com Google Sheets com sucesso.");
        }).catch(e => {
            console.error(">>> [STI] Erro ao enviar para Google (Dados salvos localmente):", e.message);
        });

        res.json({ success: true });
    } catch (err) {
        console.error("X [STI] Erro Crítico no Banco:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ==========================================
// ROTA 2: Listar Contatos (Dashboard Admin)
// ==========================================
app.get('/api/listar-contatos', async (req, res) => {
    try {
        console.log(">>> [STI] Listando contatos para o Admin...");
        const resultado = await db.query('SELECT * FROM clientes ORDER BY id DESC');
        res.json(resultado.rows);
    } catch (err) { 
        console.error("X [STI] Erro ao listar:", err.message);
        res.status(500).json([]); 
    }
});

// ==========================================
// ROTA 3: Atualizar Status
// ==========================================
app.patch('/api/atualizar-status/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await db.query('UPDATE clientes SET status = $1 WHERE id = $2', [status, id]);
        console.log(`>>> [STI] Status do ID ${id} atualizado para: ${status}`);
        res.json({ success: true });
    } catch (err) {
        console.error("X [STI] Erro ao atualizar status:", err.message);
        res.status(500).json({ error: "Erro ao atualizar status." });
    }
});

// ==========================================
// ROTA 4: Vincular Funcionário Responsável
// ==========================================
app.patch('/api/vincular-funcionario/:id', async (req, res) => {
    const { id } = req.params;
    const { funcionario } = req.body;
    try {
        await db.query('UPDATE clientes SET funcionario_resp = $1 WHERE id = $2', [funcionario, id]);
        console.log(`>>> [STI] Funcionário ${funcionario} vinculado ao ID ${id}`);
        res.json({ success: true });
    } catch (err) {
        console.error("X [STI] Erro ao vincular funcionário:", err.message);
        res.status(500).json({ error: "Erro ao vincular funcionário." });
    }
});

// ==========================================
// ROTA 5: Excluir Contato (Local)
// ==========================================
app.delete('/api/excluir-contato/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`>>> [STI] Solicitando exclusão LOCAL do ID: ${id}`);
    
    try {
        const resultado = await db.query('DELETE FROM clientes WHERE id = $1', [id]);
        
        if (resultado.rowCount > 0) {
            console.log(`v [STI] Registro ${id} removido localmente. Backup mantido no Google.`);
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, error: "Registro não encontrado." });
        }
    } catch (err) {
        console.error("X [STI] Erro na exclusão local:", err.message);
        res.status(500).json({ success: false, error: "Falha na exclusão." });
    }
});

// ==========================================
// Inicialização do Servidor (Ajuste para NUVEM)
// ==========================================
// O Render define a porta automaticamente. Usamos a 3000 apenas como reserva local.
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`>>> [STI] BACKEND ATIVO NA PORTA ${PORT}`);
    console.log(`>>> [STI] MODO: ${process.env.DATABASE_URL ? 'NUVEM' : 'LOCAL/DOCKER'}`);
    console.log(`=========================================`);
});