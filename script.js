document.addEventListener("DOMContentLoaded", () => {
  const WHATSAPP_NUMERO = "5541988685625";
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwsSkGetSPTiYirnM1SFWMZ1AQPL6iMf3sEWzQH7kd7B8ZXA7Yz9_H3pXMXEh5A4WKsNQ/exec";

  const chatMensagens = document.getElementById("chat-mensagens");
  const chatOpcoes = document.getElementById("chat-opcoes");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const btnResetChat = document.getElementById("btn-reset-chat");

  function obterOrigemTrafego(botaoOrigem = "") {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get("utm_source");
    const utmMedium = params.get("utm_medium");
    const utmCampaign = params.get("utm_campaign");

    const baseOrigem = utmSource
      ? [utmSource, utmMedium, utmCampaign].filter(Boolean).join(" / ")
      : document.referrer || "Acesso direto";

    return botaoOrigem ? `${baseOrigem} (${botaoOrigem})` : baseOrigem;
  }

  function obterDispositivo() {
    return /Mobi|Android|iPhone/i.test(navigator.userAgent) ? "Celular" : "Computador";
  }

  function enviarParaPlanilha(payload) {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes("COLE_AQUI")) return;

    fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    }).catch((err) => console.error("Erro ao registrar na planilha:", err));
  }

  const etapas = [
    {
      chave: "nicho",
      pergunta:
        "Olá! Sou o assistente da Rafa Digital. Vou te ajudar a descobrir em 30 segundos qual página traz mais resultado para você. Qual é o tipo do seu negócio?",
      placeholder: "Ou digite o tipo do seu negócio...",
      opcoes: [
        "Barbearia / Salão / Estética",
        "Clínica / Saúde / Consultório",
        "Lanchonete / Sorveteria / Delivery",
        "Oficina / Prestador de Serviços",
        "Loja / Comércio Local",
        "Outro tipo de negócio"
      ]
    },
    {
      chave: "objetivo",
      pergunta: "Show! E qual é o seu principal objetivo agora?",
      placeholder: "Ou escreva seu objetivo...",
      opcoes: [
        "Receber mais clientes no WhatsApp",
        "Ter um cardápio ou catálogo digital",
        "Aparecer melhor no Google da minha região",
        "Profissionalizar o link da bio do Instagram"
      ]
    },
    {
      chave: "urgencia",
      pergunta: "Perfeito. Para quando você gostaria de colocar essa página no ar?",
      placeholder: "Ou digite o prazo desejado...",
      opcoes: [
        "O quanto antes (esta semana)",
        "Nos próximos 15 dias",
        "Só estou pesquisando valores e ideias"
      ]
    }
  ];

  let etapaAtual = 0;
  let respostas = {};
  let origemBotaoAtual = "";
  let triagemFinalizada = false;

  function rolarParaBaixo() {
    chatMensagens.scrollTop = chatMensagens.scrollHeight;
  }

  function adicionarMensagem(texto, tipo, htmlExtra = "") {
    const div = document.createElement("div");
    div.className = `msg ${tipo === "ia" ? "msg-ia" : "msg-user"}`;
    div.textContent = texto;

    if (htmlExtra) {
      const extraContainer = document.createElement("div");
      extraContainer.innerHTML = htmlExtra;
      div.appendChild(extraContainer);
    }

    chatMensagens.appendChild(div);
    rolarParaBaixo();
  }

  function renderizarOpcoes(listaOpcoes) {
    chatOpcoes.innerHTML = "";
    listaOpcoes.forEach((opcao) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip-opcao";
      btn.textContent = opcao;
      btn.addEventListener("click", () => processarResposta(opcao));
      chatOpcoes.appendChild(btn);
    });
  }

  function diagnosticarModelo(dados) {
    const texto = `${dados.nicho} ${dados.objetivo}`.toLowerCase();

    if (
      texto.includes("lanchonete") ||
      texto.includes("sorveteria") ||
      texto.includes("delivery") ||
      texto.includes("cardápio") ||
      texto.includes("cardapio") ||
      texto.includes("catálogo") ||
      texto.includes("catalogo") ||
      texto.includes("loja")
    ) {
      return {
        modelo: "Página + Cardápio / Catálogo Digital",
        motivo:
          "Esse formato organiza seus produtos com fotos e preços para o cliente montar o pedido sozinho e enviar pronto no seu WhatsApp."
      };
    }

    return {
      modelo: "Landing Page Express de Alta Conversão",
      motivo:
        "Ela apresenta seus serviços de forma direta, passa credibilidade no Google e Instagram e leva o cliente pronto para fechar no seu WhatsApp."
    };
  }

  function finalizarTriagem() {
    if (triagemFinalizada) return;
    triagemFinalizada = true;

    chatOpcoes.innerHTML = "";
    chatInput.disabled = true;
    chatInput.placeholder = "Triagem concluída! Clique no botão acima para falar com o Rafa.";

    const resultado = diagnosticarModelo(respostas);
    const origem = obterOrigemTrafego(origemBotaoAtual);
    const dispositivo = obterDispositivo();

    enviarParaPlanilha({
      nicho: respostas.nicho,
      objetivo: respostas.objetivo,
      urgencia: respostas.urgencia,
      modelo: resultado.modelo,
      origem: origem,
      dispositivo: dispositivo,
      clicouWhats: "Concluiu triagem"
    });

    const mensagemWhats =
      `Olá Rafa! Fiz a triagem com o Assistente IA da Rafa Digital:\n` +
      `• Negócio: ${respostas.nicho}\n` +
      `• Objetivo: ${respostas.objetivo}\n` +
      `• Prazo: ${respostas.urgencia}\n` +
      `• Modelo indicado: ${resultado.modelo}\n\n` +
      `Quero ver como funciona para o meu negócio!`;

    const linkWhats = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagemWhats)}`;

    const resumoTexto =
      `Analisei o seu perfil (${respostas.nicho}) e a melhor escolha para você é: ${resultado.modelo}. ${resultado.motivo}`;

    const botaoHtml = `<a href="${linkWhats}" target="_blank" rel="noopener noreferrer" id="btn-final-whats" class="msg-cta-whats" data-origem="chat_ia_whatsapp">Enviar diagnóstico no WhatsApp do Rafa ↗</a>`;

    adicionarMensagem(resumoTexto, "ia", botaoHtml);
  }

  function processarResposta(valor) {
    if (triagemFinalizada) return;
    const textoLimpo = valor.trim();
    if (!textoLimpo) return;

    adicionarMensagem(textoLimpo, "user");
    respostas[etapas[etapaAtual].chave] = textoLimpo;
    etapaAtual++;

    if (etapaAtual < etapas.length) {
      setTimeout(() => {
        const proxima = etapas[etapaAtual];
        chatInput.placeholder = proxima.placeholder;
        adicionarMensagem(proxima.pergunta, "ia");
        renderizarOpcoes(proxima.opcoes);
      }, 280);
    } else {
      setTimeout(finalizarTriagem, 300);
    }
  }

  function iniciarChat(novaOrigem = "") {
    etapaAtual = 0;
    respostas = {};
    triagemFinalizada = false;
    if (novaOrigem) {
      origemBotaoAtual = novaOrigem;
    }
    chatMensagens.innerHTML = "";
    chatOpcoes.innerHTML = "";
    chatInput.disabled = false;
    chatInput.value = "";
    chatInput.placeholder = etapas[0].placeholder;

    adicionarMensagem(etapas[0].pergunta, "ia");
    renderizarOpcoes(etapas[0].opcoes);
  }

  document.querySelectorAll('a[href="#triagem-ia"]').forEach((link) => {
    link.addEventListener("click", () => {
      const origemClicada = link.getAttribute("data-origem") || "";
      if (origemClicada) {
        origemBotaoAtual = origemClicada;
      }
      if (triagemFinalizada) {
        iniciarChat(origemClicada);
      }
      setTimeout(() => {
        if (!chatInput.disabled) {
          chatInput.focus();
        }
      }, 350);
    });
  });

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (chatInput.disabled) return;
    const valor = chatInput.value;
    chatInput.value = "";
    processarResposta(valor);
  });

  btnResetChat.addEventListener("click", () => iniciarChat());

  iniciarChat();
});
