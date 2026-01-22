const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const express = require('express');
const cors = require('cors'); 
const path = require('path');
const db = require('./database'); 

const app = express();

// Configuração de CORS para permitir acesso do Admin (porta 8080)
app.use(cors({ origin: '*' })); 
app.use(express.json());

const frontendPath = '/app/frontend';
app.use(express.static(frontendPath));

const GOOGLE_URL = "https://script.google.com/macros/s/AKfycbzW943XeOeG9MJNf7Mf5XDxb5w6E0jo12A-AAdZsH-YLhTVWkZ5ZEv1DRxZ5QsUKTv3-w/exec";

// Rota para Salvar Agendamento
app.post('/api/salvar-contato', async (req, res) => {
    const { nome, telefone, mensagem, email } = req.body; 
    console.log(`>>> [STI] Processando: ${nome}`);

    try {
        // 1. Grava no Postgres Local
        await db.query('INSERT INTO clientes (nome_completo, telefone, email, status) VALUES ($1, $2, $3, $4)', 
        [nome, telefone, email || 'nao@informado.com', 'Pendente']);
        console.log("v Gravado no Postgres.");

        // 2. Envia para o Google com o TIMEOUT MANTIDO
        console.log("-> Tentando sincronizar com Google Sheets...");
        const response = await fetch(GOOGLE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, telefone, mensagem, email }),
            redirect: 'follow',
            signal: AbortSignal.timeout(10000) 
        });

        const resText = await response.text();
        console.log(">>> [STI] Resposta do Google:", resText);

        res.json({ success: true });
    } catch (err) {
        console.error("X [STI] Erro na sincronização Google:", err.message);
        res.json({ success: true, warning: "Salvo localmente, erro na nuvem." });
    }
});

// Rota para o Admin Listar Contatos
app.get('/api/listar-contatos', async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM clientes ORDER BY id DESC');
        res.json(resultado.rows);
    } catch (err) {
        console.error("Erro ao listar:", err.message);
        res.status(500).json([]);
    }
});

// Rota para Atualizar Status
app.patch('/api/atualizar-status/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await db.query('UPDATE clientes SET status = $1 WHERE id = $2', [status, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Erro ao atualizar." });
    }
});

// Inicialização do Servidor (Mantendo seus logs)
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`BACKEND ATIVO NA PORTA ${PORT}`);
    console.log(`=========================================`);
});