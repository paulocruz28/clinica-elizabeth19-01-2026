// Aguarda o site carregar completamente
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. MENU MOBILE ---
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".navbar");

    if(hamburger) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        });
    }

    document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
    }));


    // --- 2. EFEITO DE SCROLL NO HEADER ---
    const header = document.querySelector(".header");
    
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });


    // --- 3. ENVIO REAL PARA O NODE.JS (ATUALIZADO) ---
    const form = document.getElementById("form-agendamento");

    if(form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault(); // Impede a página de recarregar
            
            // Pega os dados digitados
            // OBS: O servidor atual espera: nome, telefone, mensagem.
            // (Email e Queixa serão enviados, mas precisamos atualizar o server.js depois para salvá-los)
            const dados = {
                nome: document.getElementById("nome").value,
                email: document.getElementById("email").value, 
                queixa: document.getElementById("queixa").value,
                telefone: document.getElementById("telefone").value,
                mensagem: document.getElementById("mensagem").value
            };
        
            // Envia para a rota correta que criamos no server.js
            fetch('/api/salvar-contato', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            })
            .then(response => response.json())
            .then(data => {
                // Sucesso!
                alert("Mensagem salva no Banco de Dados com sucesso!"); 
                console.log("ID do registro:", data.id);
                form.reset(); // Limpa os campos
            })
            .catch(error => {
                console.error('Erro:', error);
                alert("Erro ao conectar com o servidor. Verifique se o comando 'node server.js' está rodando.");
            });
        });
    }


    // --- 4. CALCULADORA IMC ---
    const btnCalcular = document.getElementById("btn-calcular");
    
    if(btnCalcular) { 
        btnCalcular.addEventListener("click", () => {
            const peso = parseFloat(document.getElementById("peso").value);
            const altura = parseFloat(document.getElementById("altura").value);
            const resultado = document.getElementById("resultado-imc");
            
            if (peso && altura) {
                const imc = peso / (altura * altura);
                let classificacao = "";
                let cor = "";

                if (imc < 18.5) {
                    classificacao = "Abaixo do peso.";
                    cor = "#e67e22"; 
                } else if (imc < 24.9) {
                    classificacao = "Peso saudável. Parabéns! (ODS 3)";
                    cor = "#27ae60"; 
                } else {
                    classificacao = "Sobrepeso. Cuide da sua saúde cardiovascular.";
                    cor = "#c0392b"; 
                }

                resultado.style.color = cor;
                resultado.innerHTML = `IMC: ${imc.toFixed(2)} - ${classificacao}`;
            } else {
                resultado.innerHTML = "Por favor, preencha todos os campos.";
                resultado.style.color = "red";
            }
        });
    }


    // --- 5. LOGICA DO MODAL DE PROCEDIMENTOS ---
    const modal = document.getElementById("modal-procedimento");
    const modalImg = document.getElementById("modal-img");
    const modalTitulo = document.getElementById("modal-titulo");
    const modalDesc = document.getElementById("modal-desc");
    const closeBtn = document.querySelector(".close-btn");
    const procItems = document.querySelectorAll(".proc-item");

    if(modal) { // Verifica se o modal existe na página para evitar erros
        // Função para abrir o modal
        procItems.forEach(item => {
            item.addEventListener("click", () => {
                const titulo = item.getAttribute("data-titulo");
                const img = item.getAttribute("data-img");
                const desc = item.getAttribute("data-desc");

                modalTitulo.textContent = titulo;
                modalImg.src = img;
                modalDesc.textContent = desc;

                modal.classList.add("active");
            });
        });

        // Função para fechar o modal
        function fecharModal() {
            modal.classList.remove("active");
        }

        // Fecha ao clicar no X
        if(closeBtn) {
            closeBtn.addEventListener("click", fecharModal);
        }

        // Fecha ao clicar fora da caixa branca
        window.addEventListener("click", (e) => {
            if (e.target === modal) {
                fecharModal();
            }
        });
        
        // Torna global para o botão "Quero Agendar Este"
        window.fecharModal = fecharModal;
    }

    async function carregarAgendamentos() {
        try {
            const resposta = await fetch('/api/listar-contatos');
            const agendamentos = await resposta.json();
            
            const corpoTabela = document.querySelector("#tabela-contatos tbody");
            
            // SÓ TENTA PREENCHER SE A TABELA EXISTIR NO HTML
            if (corpoTabela) {
                corpoTabela.innerHTML = ""; 
                agendamentos.forEach(cli => {
                    const linha = `
                        <tr style="border-bottom: 1px solid #ddd;">
                            <td style="padding: 10px;">${new Date(cli.data_envio).toLocaleString('pt-BR')}</td>
                            <td style="padding: 10px;">${cli.nome}</td>
                            <td style="padding: 10px;">${cli.telefone}</td>
                            <td style="padding: 10px;">${cli.mensagem}</td>
                        </tr>
                    `;
                    corpoTabela.innerHTML += linha;
                });
            }
        } catch (erro) {
            console.error("Erro ao carregar lista:", erro);
        }
    }

    // CHAMA A FUNÇÃO PARA CARREGAR OS DADOS
    carregarAgendamentos();
    
}); // <--- ESTA CHAVE FECHA O DOMContentLoaded