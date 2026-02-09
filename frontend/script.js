/**
 * [STI] Script Frontend - Clínica Elizabeth Cruz
 * Versão: 2.9 - UNIFICADA (Correção de Rede + Integridade STI)
 * Descrição: Fusão de Protocolos HTTPS com IMC, Modal, Máscaras e Menu.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- [STI] CONFIGURAÇÃO DA API ---
    // Detecta se está local (3000) ou no Render (HTTPS sem porta 3000)
    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? `http://localhost:3000` 
        : `https://clinica-elizabeth19-01-2026.onrender.com`;

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
        if(hamburger) hamburger.classList.remove("active");
        if(navMenu) navMenu.classList.remove("active");
    }));


    // --- 2. EFEITO DE SCROLL NO HEADER ---
    const header = document.querySelector(".header");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            if(header) header.classList.add("scrolled");
        } else {
            if(header) header.classList.remove("scrolled");
        }
    });


    // --- 3. ENVIO DE AGENDAMENTO (CONEXÃO SEGURA STI) ---
    const form = document.getElementById("form-agendamento");

    if(form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault(); 
            
            const dados = {
                nome: document.getElementById("nome").value,
                email: document.getElementById("email").value, 
                queixa: document.getElementById("queixa").value,
                telefone: document.getElementById("telefone").value,
                mensagem: document.getElementById("mensagem").value,
                cpf: document.getElementById("cpf") ? document.getElementById("cpf").value : '---'
            };
        
            console.log(">>> [STI] Enviando dados para:", `${API_BASE_URL}/api/salvar-contato`);

            fetch(`${API_BASE_URL}/api/salvar-contato`, {
                method: 'POST',
                mode: 'cors',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(dados)
            })
            .then(response => {
                if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
                return response.json();
            })
            .then(data => {
                alert("Agendamento enviado com sucesso! Entraremos em contato."); 
                console.log(">>> [STI] Resposta Sucesso:", data);
                form.reset(); 
            })
            .catch(error => {
                console.error('>>> [STI] Erro de Conexão:', error);
                alert(`Erro de conexão com o servidor STI.\nLocal da tentativa: ${API_BASE_URL}\n\nVerifique se o backend no Render está 'Live'.`);
            });
        });
    }


    // --- 4. CALCULADORA IMC (INTEGRAL ODS 3) ---
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

                if(resultado) {
                    resultado.style.color = cor;
                    resultado.innerHTML = `IMC: ${imc.toFixed(2)} - ${classificacao}`;
                }
            } else {
                if(resultado) {
                    resultado.innerHTML = "Por favor, preencha todos os campos.";
                    resultado.style.color = "red";
                }
            }
        });
    }


    // --- 5. LÓGICA DO MODAL DE PROCEDIMENTOS (COMPLETA) ---
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
                    if(modalTitulo) modalTitulo.textContent = titulo;
                    if(modalImg) modalImg.src = img;
                    if(modalDesc) modalDesc.textContent = desc;
                    modal.classList.add("active");
                }
            });
        });

        const fecharModal = () => modal.classList.remove("active");
        if(closeBtn) closeBtn.addEventListener("click", fecharModal);
        window.addEventListener("click", (e) => { if (e.target === modal) fecharModal(); });
        window.fecharModal = fecharModal;
    }


    // --- 6. MÁSCARA DE CPF E UTILITÁRIOS ---
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