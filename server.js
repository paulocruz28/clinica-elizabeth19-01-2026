const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

// Link único do seu Google Apps Script (o mesmo para POST e GET)
const GOOGLE_URL = "https://script.google.com/macros/s/AKfycbzW943XeOeG9MJNf7Mf5XDxb5w6E0jo12A-AAdZsH-YLhTVWkZ5ZEv1DRxZ5QsUKTv3-w/exec";

// 1. Rota Principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. Rota da Área Administrativa
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// 3. Rota para SALVAR agendamento (POST)
app.post('/api/salvar-contato', async (req, res) => {
    const { nome, telefone, mensagem } = req.body;
    try {
        await fetch(GOOGLE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome, 
                telefone, 
                mensagem,
                data_envio: new Date().toLocaleString("pt-BR") // Mudei de 'data' para 'data_envio'
            })
        });
        res.json({ message: "Sucesso!" });
    } catch (e) {
        console.error("Erro ao salvar:", e);
        res.status(500).json({ error: "Erro ao enviar" });
    }
});

// 4. Rota para LISTAR agendamentos no Admin (GET)
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));