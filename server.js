const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para salvar no Google Sheets
app.post('/api/salvar-contato', async (req, res) => {
    const { nome, telefone, mensagem } = req.body;
    
    // COLE SUA URL DO GOOGLE ABAIXO
    const GOOGLE_URL = "SUA_URL_DO_SCRIPT_AQUI"; 

    try {
        await fetch(GOOGLE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome, telefone, mensagem,
                data: new Date().toLocaleString("pt-BR")
            })
        });
        res.json({ message: "Sucesso!" });
    } catch (e) {
        console.error("Erro ao enviar para o Google:", e.message);
        res.status(500).json({ error: "Erro ao enviar" });
    }
});

// Rota vazia para não dar erro no Script.js enquanto não temos a tabela
app.get('/api/listar-contatos', (req, res) => {
    res.json([]); 
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));