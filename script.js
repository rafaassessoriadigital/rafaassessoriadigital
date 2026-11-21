document.addEventListener("DOMContentLoaded", () => {
  const WHATSAPP_NUMERO = "5541988685625";
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby2F8PlT-PEVRzfNmXHTBhGgYKLX0xQCtdaPkCUHtPnToDIx2hY9Ik1UKDPL_WMEk09Tw/exec";

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

  function primeiroNome() {
    if (!respostas.nome) return "";
    return respostas.nome.trim().split(/\s+/)[0];
  }

  const etapas = [
    {
      chave: "nome",
      pergunta: () =>
        "Olá! Que bom ter você por aqui! 🚀 Sou o assistente da Rafa Digital e vou te ajudar a desenhar a presença digital ideal para fazer o seu negócio vender todos os dias. Para começarmos, como posso te chamar?",
      placeholder: "Digite seu nome...",
      opcoes: []
    },
    {
      chave: "regiao",
      pergunta: () =>
        `Prazer, ${primeiroNome()}! Muito bom ver você dando esse passo para profissionalizar seu posicionamento. Em qual bairro e cidade você atua (ou pretende atuar)?`,
      placeholder: "Ex: Centro, Pinhais - PR",
      opcoes: []
    },
    {
      chave: "nicho",
      pergunta: () =>
        `Excelente! Conhecer a região (${respostas.regiao}) ajuda muito a destacar você da concorrência local. Qual é o seu nicho ou ramo de atuação?`,
      placeholder: "Ou digite o seu ramo de atuação...",
      opcoes: [
        "Barbearia / Salão / Estética",
        "Clínica / Saúde / Consultório",
        "Lanchonete / Sorveteria / Delivery",
        "Oficina / Prestador de Serviços",
        "Loja / Comércio Local",
        "Outro nicho"
      ]
    },
    {
      chave: "negocioProprio",
      pergunta: () =>
        `Show de bola, ${primeiroNome()}! O mercado de "${respostas.nicho}" tem muito espaço para quem se posiciona bem. Você já tem um negócio próprio rodando aí na região ou está estruturando agora?`,
      placeholder: "Ou escreva sua situação atual...",
      opcoes: [
        "Já tenho negócio próprio ativo na região",
        "Atendo em domicílio / online na região",
        "Estou abrindo / estruturando o negócio agora"
      ]
    },
    {
      chave: "porte",
      pergunta: () =>
        "Perfeito! Para eu te indicar uma estrutura compatível com o seu momento atual, qual é hoje o tamanho aproximado da sua operação (faturamento médio e equipe)?",
      placeholder: "Ou descreva sua equipe e faturamento médio...",
      opcoes: [
        "Trabalho sozinho • até R$ 5 mil/mês",
        "Pequena equipe (2 a 5) • R$ 5 mil a R$ 20 mil/mês",
        "Operação consolidada (6+) • acima de R$ 20 mil/mês",
        "Ainda vou iniciar o faturamento"
      ]
    },
    {
      chave: "desejo",
      pergunta: () =>
        `Última pergunta, ${primeiroNome()}! Qual é o seu maior desejo ou meta com essa página hoje?`,
      placeholder: "Ou escreva o que você mais quer conquistar...",
      opcoes: [
        "Lotar meu WhatsApp de clientes qualificados",
        "Ser encontrado no Google da minha região",
        "Ter um cardápio ou catálogo que vende sozinho",
        "Passar mais profissionalismo e cobrar melhor"
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
    if (!listaOpcoes || listaOpcoes.length === 0) return;

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
    const texto = `${dados.nicho} ${dados.desejo}`.toLowerCase();

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
          "Esse formato organiza seus produtos com fotos e preços para o cliente montar o pedido sozinho e enviar mastigado no seu WhatsApp."
      };
    }

    if (dados.porte && dados.porte.includes("consolidada")) {
      return {
        modelo: "Landing Page Premium + Funil de Qualificação",
        motivo:
          "Para uma operação já consolidada, uma página de alta conversão com triagem automática filtra curiosos e entrega clientes prontos para a sua equipe fechar."
      };
    }

    return {
      modelo: "Landing Page Express de Alta Conversão",
      motivo:
        "Ela posiciona você com autoridade no Google e Instagram da sua região e transforma visitantes em clientes prontos no seu WhatsApp."
    };
  }

  function finalizarTriagem() {
    if (triagemFinalizada) return;
    triagemFinalizada = true;

    chatOpcoes.innerHTML = "";
    chatInput.disabled = true;
    chatInput.placeholder = "Diagnóstico pronto! Clique no botão acima para falar com o Rafa.";

    const resultado = diagnosticarModelo(respostas);
    const origem = obterOrigemTrafego(origemBotaoAtual);
    const dispositivo = obterDispositivo();

    enviarParaPlanilha({
      nome: respostas.nome,
      regiao: respostas.regiao,
      nicho: respostas.nicho,
      negocioProprio: respostas.negocioProprio,
      porte: respostas.porte,
      desejo: respostas.desejo,
      modelo: resultado.modelo,
      origem: origem,
      dispositivo: dispositivo,
      clicouWhats: "Concluiu triagem"
    });

    const mensagemWhats =
      `Olá Rafa! Tudo bem? Sou *${respostas.nome}* e fiz o diagnóstico no site da Rafa Digital:\n\n` +
      `• *Região:* ${respostas.regiao}\n` +
      `• *Nicho:* ${respostas.nicho}\n` +
      `• *Momento:* ${respostas.negocioProprio}\n` +
      `• *Porte:* ${respostas.porte}\n` +
      `• *Desejo principal:* ${respostas.desejo}\n` +
      `• *Modelo indicado:* ${resultado.modelo}\n\n` +
      `Quero ver como podemos colocar isso no ar!`;

    const linkWhats = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagemWhats)}`;

    const resumoTexto =
      `Incrível, ${primeiroNome()}! Analisei o cenário do seu negócio em ${respostas.regiao} e a melhor escolha para você é: ${resultado.modelo}. ${resultado.motivo}`;

    const botaoHtml = `<a href="${linkWhats}" target="_blank" rel="noopener noreferrer" id="btn-final-whats" class="msg-cta-whats" data-origem="chat_ia_whatsapp">Falar com o Rafa no WhatsApp ↗</a>`;

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
        adicionarMensagem(proxima.pergunta(), "ia");
        renderizarOpcoes(proxima.opcoes);
        if (!proxima.opcoes || proxima.opcoes.length === 0) {
          chatInput.focus();
        }
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

    adicionarMensagem(etapas[0].pergunta(), "ia");
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
