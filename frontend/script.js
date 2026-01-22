document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#form-agendamento');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const dados = {
                nome: document.querySelector('#nome').value,
                telefone: document.querySelector('#telefone').value,
                email: document.querySelector('#email').value,
                mensagem: document.querySelector('#mensagem').value
            };

            console.log("Iniciando envio para o backend...", dados);

            try {
                // Tenta enviar para o backend na porta 3000
                const resposta = await fetch('http://localhost:3000/api/salvar-contato', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dados)
                });

                if (!resposta.ok) {
                    throw new Error(`Erro HTTP: ${resposta.status}`);
                }

                const resultado = await resposta.json();

                if (resultado.success) {
                    alert('Agendamento realizado com sucesso! Dra. Elizabeth Cruz agradece.');
                    form.reset();
                } else {
                    throw new Error(resultado.error || 'Erro no processamento do servidor');
                }

            } catch (erro) {
                console.error("Falha na requisição:", erro);
                alert('Erro ao enviar agendamento. O servidor na porta 3000 pode estar desligado ou bloqueando o acesso.');
            }
        });
    }
});