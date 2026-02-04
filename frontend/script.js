// Aguarda o site carregar completamente
document.addEventListener('DOMContentLoaded', () => {
    
    // --- CONFIGURAÇÃO DA API [STI] ---
    // Esta lógica detecta automaticamente se o site está no Render ou no seu PC local.
    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? `http://localhost:3000` // Endereço para testes no seu PC
        : `https://clinica-elizabeth-site-oficial.onrender.com`; // Endereço oficial do seu Backend no Render

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
            
            const dados = {
                nome: document.getElementById("nome").value,
                email: document.getElementById("email").value, 
                queixa: document.getElementById("queixa").value,
                telefone: document.getElementById("telefone").value,
                mensagem: document.getElementById("mensagem").value,
                cpf: document.getElementById("cpf") ? document.getElementById("cpf").value : '---'
            };
        
            console.log(">>> [STI] Enviando dados para:", `${API_BASE_URL}/api/salvar-contato`);

            // Envia para a rota correta configurada acima
            fetch(`${API_BASE_URL}/api/salvar-contato`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            })
            .then(response => {
                if (!response.ok) throw new Error('Erro na resposta do servidor');
                return response.json();
            })
            .then(data => {
                // Sucesso!
                alert("Agendamento enviado com sucesso! Entraremos em contato."); 
                console.log("ID do registro:", data.id);
                form.reset(); // Limpa os campos
            })
            .catch(error => {
                console.error('>>> [STI] Erro de Conexão:', error);
                alert("Erro ao conectar com o servidor. O agendamento não pôde ser concluído.");
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

    if(modal) { 
        procItems.forEach(item => {
            item.addEventListener("click", (e) => {
                if(e.target.tagName === 'A' || e.target.classList.contains('read-more')) return;

                const titulo = item.getAttribute("data-titulo");
                const img = item.getAttribute("data-img");
                const desc = item.getAttribute("data-desc");

                if(titulo && desc) {
                    modalTitulo.textContent = titulo;
                    modalImg.src = img;
                    modalDesc.textContent = desc;
                    modal.classList.add("active");
                }
            });
        });

        function fecharModal() {
            modal.classList.remove("active");
        }

        if(closeBtn) {
            closeBtn.addEventListener("click", fecharModal);
        }

        window.addEventListener("click", (e) => {
            if (e.target === modal) {
                fecharModal();
            }
        });
        
        window.fecharModal = fecharModal;
    }

    // Função de máscara de CPF
    window.mascaraCPF = function(i) {
        let v = i.value;
        if(isNaN(v[v.length-1])){ 
            i.value = v.substring(0, v.length-1);
            return;
        }
        i.setAttribute("maxlength", "14");
        if (v.length == 3 || v.length == 7) i.value += ".";
        if (v.length == 11) i.value += "-";
    }
});