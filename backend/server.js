const express = require('express');
const path = require('path');
const db = require('./database'); // Conexão com o PostgreSQL

const app = express();

// Configurações
app.use(express.json());
app.use(express.static(__dirname));

// URL do seu Google Apps Script (Para manter o legado enquanto migramos)
const GOOGLE_URL = "https://script.google.com/macros/s/AKfycbzW943XeOeG9MJNf7Mf5XDxb5w6E0jo12A-AAdZsH-YLhTVWkZ5ZEv1DRxZ5QsUKTv3-w/exec";

// --- ROTAS DE TESTE E NAVEGAÇÃO ---

// Rota Principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota da Área Administrativa
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Rota de teste para ver se o banco PostgreSQL responde
app.get('/testar-banco', async (req, res) => {
  try {
    const resultado = await db.query('SELECT NOW()'); 
    res.json({ mensagem: 'Conectado ao Postgres!', hora: resultado.rows[0].now });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// --- ROTAS DE AGENDAMENTO (INTEGRANDO COM GOOGLE E POSTGRES) ---

// Rota para SALVAR agendamento
app.post('/api/salvar-contato', async (req, res) => {
    const { nome, telefone, mensagem } = req.body;
    try {
        // 1. Salva no Banco de Dados PostgreSQL (O seu novo "Cérebro")
        const querySQL = 'INSERT INTO clientes (nome_completo, telefone, email, senha_hash) VALUES ($1, $2, $3, $4)';
        await db.query(querySQL, [nome, telefone, 'vazio@temp.com', '123456']);

        // 2. Mantém o envio para o Google (Para você não perder o que já tinha)
        await fetch(GOOGLE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome, 
                telefone, 
                mensagem,
                data_envio: new Date().toLocaleString("pt-BR")
            })
        });

        res.json({ message: "Sucesso! Salvo no Postgres e no Google." });
    } catch (e) {
        console.error("Erro ao salvar:", e);
        res.status(500).json({ error: "Erro ao processar agendamento" });
    }
});

// Rota para LISTAR agendamentos no Admin (Busca do Google por enquanto)
app.get('/api/listar-contatos', async (req, res) => {
    try {
        const resposta = await fetch(GOOGLE_URL);
        const dados = await resposta.json();
        res.json(dados);
    } catch (e) {
        console.error("Erro ao buscar dados:", e);
        res.json([]);
    }
});

// Inicialização do Servidor (Apenas uma vez no final!)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));