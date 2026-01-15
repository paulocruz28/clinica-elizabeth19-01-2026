const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();

// 1. Configurações básicas
app.use(express.json());

// 2. Comando que "serve" os arquivos (HTML, CSS, JS do site)
// Esse comando diz ao servidor para procurar os arquivos na pasta onde o server.js está
app.use(express.static(__dirname)); 

// 3. Conexão com Banco de Dados Local
const dbPath = path.resolve(__dirname, 'clinica.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Erro no banco:', err.message);
    else console.log('Conectado ao banco SQLite.');
});

// 4. Cria a tabela
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS contatos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        telefone TEXT,
        mensagem TEXT,
        data_envio DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// 5. ROTA PRINCIPAL: Abre o site automaticamente ao entrar no link
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 6. Rota para Salvar Contato
app.post('/api/salvar-contato', async (req, res) => {
    const { nome, telefone, mensagem } = req.body;
    const sql = `INSERT INTO contatos (nome, telefone, mensagem, data_envio) VALUES (?, ?, ?, datetime('now', 'localtime'))`;
    
    db.run(sql, [nome, telefone, mensagem], async function(err) {
        if (err) return res.status(500).json({ erro: err.message });

        const idLocal = this.lastID;
        
        // --- COLE SUA URL DO GOOGLE ABAIXO ---
        const GOOGLE_URL = "https://script.google.com/macros/s/AKfycbx9b0l_cM1i1SHzDT0Km7pXONgWvQKgcKMXfWaer2VLQ1APk09suMnAUDU1GdsYS1rDRA/exec"; 
        
        if (GOOGLE_URL.includes("/exec")) {
            try {
                await fetch(GOOGLE_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nome, telefone, mensagem,
                        data: new Date().toLocaleString("pt-BR"),
                        backup_id: idLocal
                    })
                });
            } catch (e) { console.error(`Erro nuvem:`, e.message); }
        }

        res.json({ message: "Sucesso!", id: idLocal });
    });
});

// 7. Rota para Listar Agendamentos (Para a tabela que vamos fazer)
app.get('/api/listar-contatos', (req, res) => {
    db.all("SELECT * FROM contatos ORDER BY data_envio DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 8. PORTA DINÂMICA (Obrigatório para o Render)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta: ${PORT}`));