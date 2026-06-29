const corpo = document.body;
const telaCarregamento = document.getElementById("loadingScreen");
const progresso = document.getElementById("scrollProgress");
const brilhoCursor = document.getElementById("cursorGlow");
const camadaDecorativa = document.getElementById("decorLayer");
const botaoTopo = document.getElementById("backToTop");
const botaoMusica = document.getElementById("musicToggle");
const rotuloMusica = botaoMusica.querySelector(".music-label");
const gradeGaleria = document.getElementById("galleryGrid");
const botaoMural = document.getElementById("masonryMode");
const botaoCarrossel = document.getElementById("carouselMode");
const cartasFoto = [...document.querySelectorAll(".photo-card")];
const lightbox = document.getElementById("lightbox");
const imagemLightbox = document.getElementById("lightboxImage");
const legendaLightbox = document.getElementById("lightboxCaption");
const fecharLightbox = document.getElementById("lightboxClose");
const anteriorLightbox = document.getElementById("lightboxPrev");
const proximoLightbox = document.getElementById("lightboxNext");
const textoCarta = document.getElementById("handwritingText");
const botaoFinal = document.getElementById("finalButton");
const mensagemFinal = document.getElementById("finalMessage");
const marca = document.querySelector(".brand-mark");
const segredo = document.getElementById("easterEgg");
const canvas = document.getElementById("magicCanvas");
const ctx = canvas.getContext("2d");

let largura = 0;
let altura = 0;
let indiceFotoAtual = 0;
let cliquesSegredo = 0;
let cartaAnimada = false;
let particulas = [];
let ultimoRastro = 0;
let audioCtx = null;
let ganhoPrincipal = null;
let osciladoresBase = [];
let temporizadorMelodia = null;
let musicaTocando = false;

const paleta = ["#ef7aa4", "#f4c96a", "#d7c6ff", "#ffffff", "#ffb8cd", "#d9fff2"];
const melodia = [
  392, 440, 523.25, 493.88, 440, 392, 329.63, 392,
  440, 523.25, 587.33, 523.25, 493.88, 440, 392, 349.23
];

// Remove a tela inicial depois que todos os recursos principais carregam.
window.addEventListener("load", () => {
  setTimeout(() => {
    telaCarregamento.classList.add("hidden");
    corpo.classList.remove("loading");
    explosaoSuave();
  }, 900);
});

function redimensionarCanvas() {
  const escala = Math.min(window.devicePixelRatio || 1, 2);
  largura = window.innerWidth;
  altura = window.innerHeight;
  canvas.width = Math.floor(largura * escala);
  canvas.height = Math.floor(altura * escala);
  canvas.style.width = `${largura}px`;
  canvas.style.height = `${altura}px`;
  ctx.setTransform(escala, 0, 0, escala, 0, 0);
}

redimensionarCanvas();
window.addEventListener("resize", redimensionarCanvas);

function atualizarRolagem() {
  const maximo = document.documentElement.scrollHeight - window.innerHeight;
  const proporcao = maximo <= 0 ? 0 : window.scrollY / maximo;
  progresso.style.width = `${proporcao * 100}%`;
  botaoTopo.classList.toggle("visible", window.scrollY > 640);
}

window.addEventListener("scroll", atualizarRolagem, { passive: true });
atualizarRolagem();

const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (!entrada.isIntersecting) return;
    entrada.target.classList.add("visible");

    if (entrada.target === textoCarta && !cartaAnimada) {
      animarCarta();
    }
  });
}, {
  threshold: 0.16,
  rootMargin: "0px 0px -8% 0px"
});

// Revela elementos aos poucos para manter a rolagem com ritmo cinematografico.
document.querySelectorAll(".reveal").forEach((item, indice) => {
  item.style.transitionDelay = `${Math.min(indice % 6, 5) * 70}ms`;
  observador.observe(item);
});

if (textoCarta) {
  observador.observe(textoCarta);
}

function animarCarta() {
  cartaAnimada = true;
  const textoCompleto = textoCarta.textContent.trim();
  textoCarta.dataset.texto = textoCompleto;
  textoCarta.textContent = "";
  textoCarta.classList.add("typing");
  let posicao = 0;

  const escrever = () => {
    textoCarta.textContent = textoCompleto.slice(0, posicao);
    posicao += 1;

    if (posicao <= textoCompleto.length) {
      setTimeout(escrever, posicao % 7 === 0 ? 22 : 13);
    } else {
      textoCarta.classList.remove("typing");
    }
  };

  escrever();
}

botaoTopo.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Alterna a galeria entre mural e carrossel sem recriar as molduras.
botaoMural.addEventListener("click", () => {
  gradeGaleria.classList.remove("carousel");
  botaoMural.classList.add("active");
  botaoCarrossel.classList.remove("active");
});

botaoCarrossel.addEventListener("click", () => {
  gradeGaleria.classList.add("carousel");
  botaoCarrossel.classList.add("active");
  botaoMural.classList.remove("active");
  gradeGaleria.scrollTo({ left: 0, behavior: "smooth" });
});

function abrirLightbox(indice) {
  indiceFotoAtual = indice;
  const carta = cartasFoto[indiceFotoAtual];
  const imagem = carta.querySelector("img");
  const legenda = carta.querySelector("figcaption").textContent;

  imagemLightbox.src = imagem.currentSrc || imagem.src;
  imagemLightbox.alt = imagem.alt.replace("Moldura", "Imagem");
  legendaLightbox.textContent = legenda;
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  corpo.classList.add("lightbox-open");
}

function trocarFoto(direcao) {
  const total = cartasFoto.length;
  indiceFotoAtual = (indiceFotoAtual + direcao + total) % total;
  abrirLightbox(indiceFotoAtual);
}

function fecharFoto() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  corpo.classList.remove("lightbox-open");
}

cartasFoto.forEach((carta, indice) => {
  carta.addEventListener("click", () => abrirLightbox(indice));
  carta.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter" || evento.key === " ") {
      evento.preventDefault();
      abrirLightbox(indice);
    }
  });
  carta.tabIndex = 0;
});

fecharLightbox.addEventListener("click", fecharFoto);
anteriorLightbox.addEventListener("click", () => trocarFoto(-1));
proximoLightbox.addEventListener("click", () => trocarFoto(1));
lightbox.addEventListener("click", (evento) => {
  if (evento.target === lightbox) fecharFoto();
});

window.addEventListener("keydown", (evento) => {
  if (!lightbox.classList.contains("open")) return;
  if (evento.key === "Escape") fecharFoto();
  if (evento.key === "ArrowLeft") trocarFoto(-1);
  if (evento.key === "ArrowRight") trocarFoto(1);
});

// Camada de partículas compartilhada pelo cursor, carregamento e surpresa final.
window.addEventListener("pointermove", (evento) => {
  brilhoCursor.style.left = `${evento.clientX}px`;
  brilhoCursor.style.top = `${evento.clientY}px`;

  const agora = performance.now();
  if (agora - ultimoRastro > 35) {
    ultimoRastro = agora;
    particulas.push(criarParticula(evento.clientX, evento.clientY, "rastro"));
  }
}, { passive: true });

function criarDecoracao() {
  const item = document.createElement("span");
  const ehPetala = Math.random() > .45;
  item.className = ehPetala ? "floating-decor petal" : "floating-decor heart";
  item.textContent = ehPetala ? "" : "♥";
  item.style.left = `${Math.random() * 100}%`;
  item.style.fontSize = `${14 + Math.random() * 18}px`;
  item.style.animationDuration = `${9 + Math.random() * 9}s`;
  item.style.setProperty("--drift", `${(Math.random() - .5) * 160}px`);
  camadaDecorativa.appendChild(item);
  item.addEventListener("animationend", () => item.remove());
}

setInterval(criarDecoracao, 620);

function criarParticula(x, y, tipo = "brilho") {
  const angulo = Math.random() * Math.PI * 2;
  const velocidade = tipo === "confete" ? 2 + Math.random() * 6 : .8 + Math.random() * 3.2;
  return {
    x,
    y,
    vx: Math.cos(angulo) * velocidade,
    vy: Math.sin(angulo) * velocidade - (tipo === "fogo" ? 2.5 : 0),
    vida: 1,
    tamanho: tipo === "confete" ? 4 + Math.random() * 7 : 2 + Math.random() * 4,
    cor: paleta[Math.floor(Math.random() * paleta.length)],
    tipo,
    giro: Math.random() * Math.PI
  };
}

function criarCoracao(x, y) {
  const p = criarParticula(x, y, "coracao");
  p.tamanho = 8 + Math.random() * 12;
  p.vy = -1.5 - Math.random() * 2.8;
  p.vx = (Math.random() - .5) * 2.4;
  p.cor = Math.random() > .5 ? "#ef7aa4" : "#ffb8cd";
  return p;
}

function desenharCoracao(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.tamanho / 18, p.tamanho / 18);
  ctx.rotate(p.giro);
  ctx.fillStyle = p.cor;
  ctx.globalAlpha = Math.max(p.vida, 0);
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(-18, -8, -8, -22, 0, -11);
  ctx.bezierCurveTo(8, -22, 18, -8, 0, 6);
  ctx.fill();
  ctx.restore();
}

function desenharParticula(p) {
  ctx.globalAlpha = Math.max(p.vida, 0);

  if (p.tipo === "coracao") {
    desenharCoracao(p);
    return;
  }

  if (p.tipo === "confete") {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.giro);
    ctx.fillStyle = p.cor;
    ctx.fillRect(-p.tamanho / 2, -p.tamanho / 2, p.tamanho * 1.6, p.tamanho);
    ctx.restore();
    return;
  }

  ctx.fillStyle = p.cor;
  ctx.shadowColor = p.cor;
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.tamanho, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function animarCanvas() {
  ctx.clearRect(0, 0, largura, altura);

  particulas.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.tipo === "confete" ? .07 : .025;
    p.vx *= .992;
    p.giro += .04;
    p.vida -= p.tipo === "rastro" ? .035 : .014;
    desenharParticula(p);
  });

  particulas = particulas.filter((p) => p.vida > 0 && p.y < altura + 80);
  requestAnimationFrame(animarCanvas);
}

animarCanvas();

function explosaoSuave() {
  for (let i = 0; i < 70; i += 1) {
    particulas.push(criarParticula(largura * .5, altura * .42, i % 3 === 0 ? "confete" : "brilho"));
  }
}

function fogos(x, y) {
  for (let i = 0; i < 90; i += 1) {
    const p = criarParticula(x, y, "fogo");
    p.vx *= 1.55;
    p.vy *= 1.55;
    p.vida = .95;
    particulas.push(p);
  }
}

function surpresaFinal() {
  mensagemFinal.classList.add("show");
  corpo.classList.add("final-glow");
  setTimeout(() => corpo.classList.remove("final-glow"), 1900);

  for (let i = 0; i < 5; i += 1) {
    setTimeout(() => {
      fogos(largura * (.18 + Math.random() * .64), altura * (.18 + Math.random() * .34));
    }, i * 260);
  }

  for (let i = 0; i < 190; i += 1) {
    setTimeout(() => {
      particulas.push(criarParticula(Math.random() * largura, -20, "confete"));
      if (i % 3 === 0) particulas.push(criarCoracao(Math.random() * largura, altura + 20));
    }, i * 12);
  }
}

botaoFinal.addEventListener("click", surpresaFinal);

// Trilha romantica gerada no navegador; ela so comeca depois do clique.
function iniciarAudio() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  ganhoPrincipal = audioCtx.createGain();
  ganhoPrincipal.gain.value = 0.0001;
  ganhoPrincipal.connect(audioCtx.destination);

  const filtro = audioCtx.createBiquadFilter();
  filtro.type = "lowpass";
  filtro.frequency.value = 1200;
  filtro.Q.value = .8;
  filtro.connect(ganhoPrincipal);

  [196, 261.63, 329.63].forEach((freq, indice) => {
    const osc = audioCtx.createOscillator();
    const ganho = audioCtx.createGain();
    osc.type = indice === 0 ? "sine" : "triangle";
    osc.frequency.value = freq;
    ganho.gain.value = .025;
    osc.connect(ganho);
    ganho.connect(filtro);
    osc.start();
    osciladoresBase.push(osc);
  });

  ganhoPrincipal.gain.exponentialRampToValueAtTime(.22, audioCtx.currentTime + .8);
  let passo = 0;

  temporizadorMelodia = setInterval(() => {
    tocarNota(melodia[passo % melodia.length], .82);
    if (passo % 4 === 0) tocarNota(melodia[(passo + 4) % melodia.length] / 2, 1.35, .03, .04);
    passo += 1;
  }, 760);
}

function tocarNota(freq, duracao = .7, atraso = 0, volume = .075) {
  if (!audioCtx || !ganhoPrincipal) return;
  const inicio = audioCtx.currentTime + atraso;
  const osc = audioCtx.createOscillator();
  const ganho = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, inicio);
  ganho.gain.setValueAtTime(.0001, inicio);
  ganho.gain.exponentialRampToValueAtTime(volume, inicio + .05);
  ganho.gain.exponentialRampToValueAtTime(.0001, inicio + duracao);
  osc.connect(ganho);
  ganho.connect(ganhoPrincipal);
  osc.start(inicio);
  osc.stop(inicio + duracao + .05);
}

function pararAudio() {
  if (!audioCtx) return;
  clearInterval(temporizadorMelodia);
  ganhoPrincipal.gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime + .35);
  setTimeout(() => {
    osciladoresBase.forEach((osc) => {
      try { osc.stop(); } catch (erro) { return erro; }
    });
    osciladoresBase = [];
    audioCtx.close();
    audioCtx = null;
    ganhoPrincipal = null;
  }, 420);
}

botaoMusica.addEventListener("click", async () => {
  musicaTocando = !musicaTocando;

  if (musicaTocando) {
    iniciarAudio();
    if (audioCtx.state === "suspended") await audioCtx.resume();
    botaoMusica.classList.add("playing");
    botaoMusica.setAttribute("aria-label", "Pausar música romântica");
    botaoMusica.title = "Pausar música";
    rotuloMusica.textContent = "Pausar música";
    tocarNota(523.25, .9, .02, .09);
  } else {
    botaoMusica.classList.remove("playing");
    botaoMusica.setAttribute("aria-label", "Tocar música romântica");
    botaoMusica.title = "Tocar música";
    rotuloMusica.textContent = "Tocar música";
    pararAudio();
  }
});

marca.addEventListener("click", () => {
  cliquesSegredo += 1;
  particulas.push(criarCoracao(marca.getBoundingClientRect().left + 18, marca.getBoundingClientRect().top + 18));

  if (cliquesSegredo >= 7) {
    cliquesSegredo = 0;
    segredo.classList.add("show");
    fogos(largura * .5, altura * .32);
    setTimeout(() => segredo.classList.remove("show"), 4600);
  }
});
