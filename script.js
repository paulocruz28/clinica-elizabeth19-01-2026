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


    // --- 3. SIMULAÇÃO DE ENVIO DE FORMULÁRIO ---
    const form = document.getElementById("form-agendamento");

    if(form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault(); 
            const nome = document.getElementById("nome").value;
            alert(`Obrigado, ${nome}! Sua solicitação de triagem foi enviada. Entraremos em contato.`);
            form.reset();
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
    
    // Seleciona os elementos
    const modal = document.getElementById("modal-procedimento");
    const modalImg = document.getElementById("modal-img");
    const modalTitulo = document.getElementById("modal-titulo");
    const modalDesc = document.getElementById("modal-desc");
    const closeBtn = document.querySelector(".close-btn");
    const procItems = document.querySelectorAll(".proc-item");

    // Função para abrir o modal
    procItems.forEach(item => {
        item.addEventListener("click", () => {
            // Pega os dados guardados no HTML (data-...)
            const titulo = item.getAttribute("data-titulo");
            const img = item.getAttribute("data-img");
            const desc = item.getAttribute("data-desc");

            // Coloca esses dados dentro do modal
            modalTitulo.textContent = titulo;
            modalImg.src = img;
            modalDesc.textContent = desc;

            // Mostra o modal
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

    // Fecha ao clicar fora da caixa branca (no fundo escuro)
    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            fecharModal();
        }
    });
    
    // Torna a função fecharModal global para o botão "Agendar" usar
    window.fecharModal = fecharModal;
});