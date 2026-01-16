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
    
    // URL do seu Script do Google
    const GOOGLE_URL = "https://script.google.com/macros/s/AKfycbw2_TSSYDt0icZA200X4AxG7wtC2saqJNHhRYRqjwUO-ylGXlh8sa5CH2htKcJ5R_2nyg/exec"; 

    try {
        await fetch(GOOGLE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome: nome,
                telefone: telefone,
                mensagem: mensagem,
                data: new Date().toLocaleString("pt-BR")
            })
        });
        res.json({ message: "Sucesso!", id: Date.now() });
    } catch (e) {
        console.error("Erro no servidor:", e);
        res.status(500).json({ error: "Erro ao enviar" });
    }
}); // <--- Aqui faltava fechar o POST

// Rota para não dar erro no Script.js
app.get('/api/listar-contatos', (req, res) => {
    res.json([]); 
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));