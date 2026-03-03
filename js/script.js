/* script.js - NaldoA Official (Versão Final Completa) */

document.addEventListener("DOMContentLoaded", () => {

 
    // ==========================================================
    // 2. CONFIGURAÇÃO DA RÁDIO
    // ==========================================================
     


    // ==========================================================
    // 3. BACKGROUND ESPECTRO (O Fundo animado)
    // ==========================================================
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
                    height: Math.random() * (canvasHeight * 0.2), 
                    speed: Math.random() * 2 + 1,
                    direction: 1 
                });
            }
        }

        function animateSpectrum() {
            // Limpa a tela
            ctx.fillStyle = '#030313'; 
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            // Cria o gradiente (Ouro e Azul)
            const gradient = ctx.createLinearGradient(0, canvasHeight, 0, 0);
            gradient.addColorStop(0, '#ffcc00'); // Base Ouro
            gradient.addColorStop(0.5, '#3be8ff'); // Meio Azul
            gradient.addColorStop(1, '#000000'); // Topo Preto
            ctx.fillStyle = gradient;

            // Verifica se a rádio está tocando para agitar as ondas
            const isPlaying = document.body.classList.contains('is-playing');
            const speedMultiplier = isPlaying ? 3.5 : 0.5; // Agita rápido se tocar

            bars.forEach(bar => {
                ctx.fillRect(bar.x, canvasHeight - bar.height, bar.width, bar.height);
                
                // Lógica de sobe e desce das barras
                if (bar.direction === 1) {
                    bar.height += bar.speed * speedMultiplier;
                    if (bar.height > canvasHeight * (isPlaying ? 0.8 : 0.3)) bar.direction = -1;
                } else {
                    bar.height -= bar.speed * speedMultiplier;
                    if (bar.height < canvasHeight * 0.05) bar.direction = 1;
                }
                
                // "Pulo" aleatório na batida da música
                if(isPlaying && Math.random() > 0.92) bar.height += 30;
            });
            
            // Loop da animação
            requestAnimationFrame(animateSpectrum);
        }

        // Inicia o canvas
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        animateSpectrum();
    }


   // ==========================================================
// 4. CONTROLE COMPLETO DO PLAYER DE RÁDIO (VERSÃO FINAL)
// ==========================================================

const RADIO_STREAM = "https://stream.zeno.fm/xx785t45mf9uv";

const audioEl = document.getElementById('radioAudio');
const radioBtn = document.getElementById('radioBtn');     // botão antigo (se existir)
const topPlayBtn = document.getElementById('topPlayBtn'); // botão novo topo
const topVolume = document.getElementById('topVolume');   // volume topo

// Carrega o stream
if (audioEl) {
    audioEl.src = RADIO_STREAM;
    audioEl.crossOrigin = "anonymous";
    audioEl.volume = 1;
}

// ================= PLAY / PAUSE =================

function playRadio() {
    if (!audioEl) return;

    const playPromise = audioEl.play();

    if (playPromise !== undefined) {
        playPromise
            .then(() => updateInterface(true))
            .catch(() => {
                console.log("Reconectando stream...");
                audioEl.src = RADIO_STREAM;
                audioEl.load();
                audioEl.play();
                updateInterface(true);
            });
    }
}

function pauseRadio() {
    if (!audioEl) return;
    audioEl.pause();
    updateInterface(false);
}

// Botão antigo
if (radioBtn) {
    radioBtn.addEventListener("click", () => {
        audioEl.paused ? playRadio() : pauseRadio();
    });
}

// Botão novo topo
if (topPlayBtn) {
    topPlayBtn.addEventListener("click", () => {
        audioEl.paused ? playRadio() : pauseRadio();
    });
}

// ================= VOLUME =================

if (topVolume && audioEl) {
    audioEl.volume = topVolume.value;

    topVolume.addEventListener("input", () => {
        audioEl.volume = topVolume.value;
    });
}

// ================= ATUALIZA INTERFACE =================

function updateInterface(isPlaying) {

    if (radioBtn) {
        radioBtn.textContent = isPlaying
            ? "⏸ Pausar Rádio"
            : "▶ NaldoA Play";

        radioBtn.classList.toggle("playing", isPlaying);
    }

    if (topPlayBtn) {
        topPlayBtn.textContent = isPlaying ? "⏸" : "▶";
    }

    document.body.classList.toggle("is-playing", isPlaying);
}

// ================= MEDIA SESSION (TELA BLOQUEIO) =================

if (audioEl) {

    audioEl.addEventListener('play', () => {

        if ('mediaSession' in navigator) {

            navigator.mediaSession.metadata = new MediaMetadata({
                title: 'NaldoA Play',
                artist: 'NaldoA',
                album: 'Rádio Ao Vivo',
                artwork: [
                    {
                        src: 'https://naldoaplay.github.io/naldoa/images/logo.jpg',
                        sizes: '512x512',
                        type: 'image/jpeg'
                    }
                ]
            });

            navigator.mediaSession.setActionHandler('play', playRadio);
            navigator.mediaSession.setActionHandler('pause', pauseRadio);
        }
    });
}
    // ==========================================================
    // 5. TELA DE BLOQUEIO DO CELULAR (FOTO DA RÁDIO)
    // ==========================================================
    if (audioEl) {
        audioEl.addEventListener('play', function() {
            if ('mediaSession' in navigator) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: 'NaldoA Play',
                    artist: 'NaldoA',
                    album: 'Rádio Ao Vivo',
                    artwork: [
                        // Usando Link Absoluto e Tamanho 512x512 para forçar o celular a aceitar
                        { 
                            src: 'https://naldoaplay.github.io/naldoa/images/logo.jpg', 
                            sizes: '512x512', 
                            type: 'image/jpeg' 
                        }
                    ]
                });

                // Botões da tela de bloqueio
                navigator.mediaSession.setActionHandler('play', function() {
                    audioEl.play();
                    updateInterface(true);
                });
                navigator.mediaSession.setActionHandler('pause', function() {
                    audioEl.pause();
                    updateInterface(false);
                });
            }
        });
    }


    // ==========================================================
    // 6. MODAL DE VÍDEOS & NAVEGAÇÃO
    // ==========================================================
    const modal = document.getElementById('videoModal');
    const playerFrame = document.getElementById('playerFrame');
    const closeBtn = document.querySelector('.modal-close');

    // Fecha modal
    function closeModal(){
        if(!modal || !playerFrame) return;
        playerFrame.src = ''; // Para o vídeo
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden','true');
    }

    if(closeBtn) closeBtn.addEventListener('click', closeModal);
    if(modal) modal.addEventListener('click', (e)=> { if(e.target === modal) closeModal(); });

    // Navegação Suave nos links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if(target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Clique no Logo volta ao topo
    document.querySelector('.brand')?.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

}); // Fim do DOMContentLoaded

