/* script.js - NaldoA Official
   - Background interativo
   - Rádio Player com Visualizer (Espectro)
   - Modal de Vídeos
   - Navegação Suave
*/

// ====== 1. CONFIGURAÇÃO ======
// Link da sua rádio (ZenoFM)
const RADIO_STREAM = "https://stream.zeno.fm/xx785t45mf9uv"; 

// ====== 2. BACKGROUND INTERATIVO (O Fundo que mexe) ======
const heroBg = document.querySelector('.hero-bg');

function onPointer(e){
  // Detecta se é touch ou mouse
  const p = e.touches ? e.touches[0] : e;
  
  // Calcula a posição
  const mx = (p.clientX / window.innerWidth - 0.5) * 18;
  const my = (p.clientY / window.innerHeight - 0.5) * 12;
  
  // Move o fundo levemente
  if(heroBg) {
    heroBg.style.transform = `translate(${mx}px, ${my}px) scale(1.06)`;
  }
}

// Adiciona os eventos de movimento
window.addEventListener('pointermove', onPointer, {passive:true});
window.addEventListener('touchmove', onPointer, {passive:true});
window.addEventListener('resize', ()=> heroBg && (heroBg.style.transform = 'scale(1.03)'));


// ====== 3. RADIO PLAYER & VISUALIZER (A Mágica) ======
const radioBtn = document.getElementById('radioBtn');
const audioEl = document.getElementById('radioAudio');

// Configuração inicial do áudio
if(audioEl){
  audioEl.src = RADIO_STREAM;
  audioEl.crossOrigin = "anonymous";
  // Não damos .load() aqui para não gastar dados do usuário antes da hora
}

if(radioBtn && audioEl){
  radioBtn.addEventListener('click', async () => {
    try {
      if(audioEl.paused){
        // --- LIGAR RÁDIO ---
        // Se a fonte estiver vazia, recarrega o stream (bom para rádio ao vivo)
        if(!audioEl.src || audioEl.src === window.location.href) {
            audioEl.src = RADIO_STREAM;
        }
        
        await audioEl.play();
        
        // Atualiza Botão
        radioBtn.textContent = '⏸ Pausar Rádio';
        radioBtn.classList.add('playing');
        radioBtn.setAttribute('aria-pressed','true');
        
        // 🔥 LIGA O ESPECTRO VISUAL (BARRINHAS) 🔥
        document.body.classList.add('is-playing'); 

      } else {
        // --- DESLIGAR RÁDIO ---
        audioEl.pause();
        
        // Atualiza Botão
        radioBtn.textContent = '▶ NaldoA Play';
        radioBtn.classList.remove('playing');
        radioBtn.setAttribute('aria-pressed','false');
        
        // ❄️ DESLIGA O ESPECTRO VISUAL ❄️
        document.body.classList.remove('is-playing');
        
        // Opcional: Limpa o buffer para parar de baixar dados
        audioEl.src = ""; 
      }
    } catch(e){
      console.warn('Erro ao tentar tocar a rádio:', e);
      alert("Clique novamente para iniciar a rádio.");
    }
  });
}


// ====== 4. MODAL DE VÍDEOS (YouTube Pop-up) ======
const modal = document.getElementById('videoModal'); // Se você criar o modal no HTML futuramente
const playerFrame = document.getElementById('playerFrame');
const closeBtn = document.querySelector('.modal-close');

function openModal(id){
  if(!modal || !playerFrame) return;
  playerFrame.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
}

function closeModal(){
  if(!modal || !playerFrame) return;
  playerFrame.src = ''; // Para o vídeo
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
}

// Eventos do Modal
if(closeBtn) closeBtn.addEventListener('click', closeModal);
if(modal) modal.addEventListener('click', (e)=> { if(e.target === modal) closeModal(); });

// Detecta clique na grid de vídeos (Opcional, caso queira abrir em modal)
const videoGrid = document.getElementById('videoGrid');
if(videoGrid && modal){
  videoGrid.querySelectorAll('.video-card iframe').forEach((iframe)=>{
    // Lógica para detectar cliques no iframe (requer pointer-events:none no CSS do iframe para funcionar o clique na div pai)
    const parent = iframe.parentElement;
    const idMatch = iframe.src.match(/\/embed\/([a-zA-Z0-9_-]+)/);
    
    if(idMatch) {
        // Se quiser ativar o modal ao clicar, descomente abaixo:
        // parent.addEventListener('click', () => openModal(idMatch[1]));
    }
  });
}


// ====== 5. NAVEGAÇÃO INTERNA (Scroll Suave) ======
document.querySelectorAll('.nav-btn, .hero-actions .btn, a[href^="#"]').forEach(btn => {
  btn.addEventListener('click', (ev) => {
    const href = btn.getAttribute('href') || btn.dataset.section;
    if(!href || href === '#') return;
    
    // Se for link interno (#id)
    if(href.startsWith('#')) {
        ev.preventDefault();
        const targetId = href.substring(1);
        const el = document.getElementById(targetId);
        if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
    }
  });
});

// ====== 6. CLIQUE NO LOGO (Volta ao topo) ======
const brandLogo = document.querySelector('.brand');
if(brandLogo) {
    brandLogo.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
}
/* ==========================================
   FUNDO ESPECTRO GIGANTE (SIMULADO)
   ========================================== */
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

let bars = [];
const barCount = 60; // Quantidade de barras no fundo (não exagere pra não travar)
let canvasWidth, canvasHeight;

// Configura o tamanho
function resizeCanvas() {
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  initBars();
}

// Cria as barras iniciais
function initBars() {
  bars = [];
  const barWidth = canvasWidth / barCount;
  for (let i = 0; i < barCount; i++) {
    bars.push({
      x: i * barWidth,
      y: canvasHeight,
      width: barWidth - 2, // -2 para dar um espacinho entre elas
      height: Math.random() * (canvasHeight * 0.5), // Altura inicial
      speed: Math.random() * 2 + 1, // Velocidade do movimento
      direction: 1 // 1 = subindo, -1 = descendo
    });
  }
}

// Desenha e Anima
function animateSpectrum() {
  // Limpa a tela
  ctx.fillStyle = '#030313'; // Cor de fundo pra apagar o quadro anterior
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Define a cor das barras (Gradiente Ouro -> Azul)
  const gradient = ctx.createLinearGradient(0, canvasHeight, 0, 0);
  gradient.addColorStop(0, '#ffcc00'); // Base Dourada
  gradient.addColorStop(0.5, '#3be8ff'); // Meio Azul
  gradient.addColorStop(1, '#000000'); // Topo Preto

  ctx.fillStyle = gradient;

  // Verifica se o som está tocando (baseado na classe do body)
  const isPlaying = document.body.classList.contains('is-playing');
  const speedMultiplier = isPlaying ? 2.5 : 0.5; // Se tocar, fica rápido. Se pausa, fica lento.

  // Loop para desenhar cada barra
  bars.forEach(bar => {
    // Desenha a barra
    ctx.fillRect(bar.x, canvasHeight - bar.height, bar.width, bar.height);

    // Atualiza a altura (Movimento)
    if (bar.direction === 1) {
      bar.height += bar.speed * speedMultiplier;
      if (bar.height > canvasHeight * 0.6) bar.direction = -1; // Desce se ficar muito alta
    } else {
      bar.height -= bar.speed * speedMultiplier;
      if (bar.height < canvasHeight * 0.1) bar.direction = 1; // Sobe se ficar muito baixa
    }
    
    // Aleatoriedade extra para parecer música
    if(Math.random() > 0.95) bar.speed = Math.random() * 3 + 1;
  });

  requestAnimationFrame(animateSpectrum);
}

// Inicia tudo
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
animateSpectrum();
