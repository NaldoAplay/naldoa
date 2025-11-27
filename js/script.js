/* script.js - NaldoA Official (Versão Turbo - Sem Economia) */

// ====== 1. CONFIGURAÇÃO ======
// Link da sua rádio (ZenoFM)
const RADIO_STREAM = "https://stream.zeno.fm/xx785t45mf9uv"; 

// ====== 2. BACKGROUND ESPECTRO (O Fundo que mexe) ======
const canvas = document.getElementById('bgCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let bars = [];
const barCount = 60; 
let canvasWidth, canvasHeight;

if (canvas) {
    function resizeCanvas() {
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        initBars();
    }

    function initBars() {
        bars = [];
        const barWidth = canvasWidth / barCount;
        for (let i = 0; i < barCount; i++) {
            bars.push({
                x: i * barWidth,
                y: canvasHeight,
                width: barWidth - 2,
                height: Math.random() * (canvasHeight * 0.2), // Começa baixo
                speed: Math.random() * 2 + 1,
                direction: 1 
            });
        }
    }

    function animateSpectrum() {
        ctx.fillStyle = '#030313'; // Limpa tela
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Gradiente das Barras
        const gradient = ctx.createLinearGradient(0, canvasHeight, 0, 0);
        gradient.addColorStop(0, '#ffcc00'); // Base Ouro
        gradient.addColorStop(0.5, '#3be8ff'); // Meio Azul
        gradient.addColorStop(1, '#000000'); // Topo Preto
        ctx.fillStyle = gradient;

        // Se estiver tocando, agita mais
        const isPlaying = document.body.classList.contains('is-playing');
        const speedMultiplier = isPlaying ? 3.5 : 0.5; // Bem rápido se tocar

        bars.forEach(bar => {
            ctx.fillRect(bar.x, canvasHeight - bar.height, bar.width, bar.height);
            if (bar.direction === 1) {
                bar.height += bar.speed * speedMultiplier;
                if (bar.height > canvasHeight * (isPlaying ? 0.8 : 0.3)) bar.direction = -1;
            } else {
                bar.height -= bar.speed * speedMultiplier;
                if (bar.height < canvasHeight * 0.05) bar.direction = 1;
            }
            // "Pulo" aleatório na batida
            if(isPlaying && Math.random() > 0.92) bar.height += 30;
        });
        requestAnimationFrame(animateSpectrum);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animateSpectrum();
}


// ====== 3. RADIO PLAYER (MODO TURBO) ======
const radioBtn = document.getElementById('radioBtn');
const audioEl = document.getElementById('radioAudio');

// INICIALIZAÇÃO IMEDIATA (Sem economizar dados)
if(audioEl){
    audioEl.src = RADIO_STREAM;
    audioEl.crossOrigin = "anonymous";
    audioEl.load(); // Força o navegador a preparar o áudio AGORA
}

if(radioBtn && audioEl){
    radioBtn.addEventListener('click', () => {
        // Verifica se está pausado
        if(audioEl.paused){
            // --- DAR PLAY ---
            const playPromise = audioEl.play();

            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    // Play funcionou!
                    updateInterface(true);
                })
                .catch(error => {
                    console.log("Erro no Play, tentando recarregar stream...");
                    // Se der erro, força recarregar o link e tenta de novo
                    audioEl.src = RADIO_STREAM;
                    audioEl.load();
                    audioEl.play();
                    updateInterface(true);
                });
            }
        } else {
            // --- PAUSAR ---
            audioEl.pause();
            // NÃO limpamos o SRC aqui. Deixa conectado pra voltar rápido.
            updateInterface(false);
        }
    });
}

function updateInterface(isPlaying) {
    if(isPlaying) {
        radioBtn.textContent = '⏸ Pausar Rádio';
        radioBtn.classList.add('playing');
        document.body.classList.add('is-playing'); // Liga o Espectro
    } else {
        radioBtn.textContent = '▶ NaldoA Play';
        radioBtn.classList.remove('playing');
        document.body.classList.remove('is-playing'); // Desliga o Espectro
    }
}

// Se a rádio cair sozinha (internet ruim), tenta reconectar
audioEl.addEventListener('error', (e) => {
    console.log("Queda de conexão, reconectando...");
    setTimeout(() => {
        audioEl.src = RADIO_STREAM;
        audioEl.load();
        if(document.body.classList.contains('is-playing')) audioEl.play();
    }, 3000);
});


// ====== 4. MODAL DE VÍDEOS & NAVEGAÇÃO ======
const modal = document.getElementById('videoModal');
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
    playerFrame.src = '';
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
}

if(closeBtn) closeBtn.addEventListener('click', closeModal);
if(modal) modal.addEventListener('click', (e)=> { if(e.target === modal) closeModal(); });

// Navegação Suave
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Clique no Logo volta ao topo
document.querySelector('.brand')?.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
/* === CONFIGURAÇÃO DA TELA DE BLOQUEIO (FOTO E NOME) === */
const player = document.getElementById('radioAudio');

if (player) {
    player.addEventListener('play', function() {
        if ('mediaSession' in navigator) {
           navigator.mediaSession.metadata = new MediaMetadata({
                title: 'NaldoA Play',
                artist: 'NaldoA',
                album: 'Rádio Ao Vivo',
                artwork: [
                    // O ?v=99 obriga o celular a baixar a nova versão
                    { src: 'images/logo.jpg?v=99', sizes: '96x96',   type: 'image/jpeg' },
                    { src: 'images/logo.jpg?v=99', sizes: '128x128', type: 'image/jpeg' },
                    { src: 'images/logo.jpg?v=99', sizes: '192x192', type: 'image/jpeg' },
                    { src: 'images/logo.jpg?v=99', sizes: '512x512', type: 'image/jpeg' }
                ]
            });

            // Configura os botões da tela de bloqueio (Play/Pause)
            navigator.mediaSession.setActionHandler('play', function() {
                player.play();
                updatePlayButtonUI(true); // Se você tiver uma função que atualiza o botão visual
            });
            navigator.mediaSession.setActionHandler('pause', function() {
                player.pause();
                updatePlayButtonUI(false);
            });
        }
    });
}

// Função auxiliar para atualizar o botão visual (caso seu script original não tenha)
function updatePlayButtonUI(isPlaying) {
    const btn = document.getElementById('radioBtn');
    const waves = document.querySelector('.music-waves');
    
    if (btn) {
        if (isPlaying) {
            btn.innerHTML = '⏸ Pausar Rádio';
            btn.classList.add('playing');
            if(waves) waves.style.opacity = '1';
        } else {
            btn.innerHTML = '▶ NaldoA Play';
            btn.classList.remove('playing');
            if(waves) waves.style.opacity = '0.3';
        }
    }
}
