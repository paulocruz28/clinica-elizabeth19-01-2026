/**
 * [STI] Servidor Backend - Clínica Elizabeth Cruz
 * Versão: 2.7 - Unificada (Gestão Completa + Segurança Render + Logs STI)
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const express = require('express');
const cors = require('cors'); 
const path = require('path');
const db = require('./database'); 

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true
})); 

app.options('*', cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const GOOGLE_URL = "https://script.google.com/macros/s/AKfycbzW943XeOeG9MJNf7Mf5XDxb5w6E0jo12A-AAdZsH-YLhTVWkZ5ZEv1DRxZ5QsUKTv3-w/exec";

// ==========================================
// SEÇÃO A: GESTÃO DE CLIENTES / CONTATOS
// ==========================================

app.post('/api/salvar-contato', async (req, res) => {
    const { nome, telefone, mensagem, email, cpf, queixa } = req.body; 
    console.log(`>>> [STI] Recebendo novo contato: ${nome}`);

    try {
        const sql = `INSERT INTO clientes (nome_completo, telefone, email, mensagem, cpf, queixa, status, funcionario_resp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
        await db.query(sql, [nome || 'Sem Nome', telefone || '---', email || 'nao@informado.com', mensagem || '', cpf || '---', queixa || 'Geral', 'Pendente', 'Não Atribuído']);
        
        fetch(GOOGLE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, telefone, mensagem, email, cpf, queixa }),
            redirect: 'follow',
            signal: AbortSignal.timeout(10000) 
        }).then(() => console.log(">>> [STI] Sincronizado com Google Sheets."))
          .catch(e => console.error(">>> [STI] Erro Google:", e.message));

        res.status(200).json({ success: true });
    } catch (err) {
        console.error("X [STI] Erro Crítico no Banco:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/listar-contatos', async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM clientes ORDER BY id DESC');
        res.json(resultado.rows);
    } catch (err) { res.status(500).json([]); }
});

app.patch('/api/atualizar-status/:id', async (req, res) => {
    const { id } = req.params; const { status } = req.body;
    await db.query('UPDATE clientes SET status = $1 WHERE id = $2', [status, id]);
    res.json({ success: true });
});

app.delete('/api/excluir-contato/:id', async (req, res) => {
    const { id } = req.params;
    await db.query('DELETE FROM clientes WHERE id = $1', [id]);
    res.json({ success: true });
});

// ==========================================
// SEÇÃO B: GESTÃO DE FUNCIONÁRIOS [STI]
// ==========================================

app.get('/api/funcionarios', async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM funcionarios ORDER BY nome ASC');
        res.json(resultado.rows);
    } catch (err) { res.status(500).json([]); }
});

app.post('/api/funcionarios', async (req, res) => {
    const { nome, cargo } = req.body;
    try {
        await db.query('INSERT INTO funcionarios (nome, cargo) VALUES ($1, $2)', [nome, cargo]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

app.delete('/api/funcionarios/:id', async (req, res) => {
    const { id } = req.params;
    await db.query('DELETE FROM funcionarios WHERE id = $1', [id]);
    res.json({ success: true });
});

app.patch('/api/vincular-funcionario/:id', async (req, res) => {
    const { id } = req.params; const { funcionario } = req.body;
    await db.query('UPDATE clientes SET funcionario_resp = $1 WHERE id = $2', [funcionario, id]);
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`>>> [STI] BACKEND ATIVO NA PORTA ${PORT}`);
});