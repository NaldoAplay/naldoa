/* script.js - NaldoA Official (Versão Final Completa) */

document.addEventListener("DOMContentLoaded", () => {

    // ==========================================================
// ==========================================================
    // 1. TELA DE BOAS-VINDAS E ÁUDIO INICIAL
    // ==========================================================
    const welcomeOverlay = document.getElementById('welcome-overlay');
    const enterBtn = document.getElementById('enterBtn');
    const welcomeAudio = document.getElementById('welcomeAudio');
    const radioAudioEl = document.getElementById('radioAudio'); // Pegamos a rádio aqui também
    const body = document.body;

    // Se a tela de boas-vindas existir no HTML
    if (welcomeOverlay && enterBtn) {
        // Bloqueia a rolagem (scroll) enquanto o usuário não entrar
        body.style.overflow = 'hidden';

        enterBtn.addEventListener('click', () => {
            // A. Tenta tocar o áudio de boas-vindas
            if(welcomeAudio) {
                welcomeAudio.volume = 0.8; 
                welcomeAudio.play().catch(e => console.log("Áudio bloqueado:", e));
            }

            // B. TRUQUE DE MESTRE: Começa a carregar a rádio em segredo agora!
            // Assim, quando o usuário clicar em "Play", ela já estará carregada.
            if (radioAudioEl) {
                radioAudioEl.src = "https://stream.zeno.fm/xx785t45mf9uv"; // Seu link ZenoFM
                radioAudioEl.load(); // Força a conexão imediata
            }

            // C. Esconde a tela preta suavemente
            welcomeOverlay.style.opacity = '0';
            welcomeOverlay.style.visibility = 'hidden';
            
            // D. Libera a rolagem do site
            body.style.overflow = 'auto';

            // Remove o elemento do HTML depois de 1 segundo
            setTimeout(() => {
                welcomeOverlay.remove();
            }, 1000);
        });
    }

    // ==========================================================
    // 2. CONFIGURAÇÃO DA RÁDIO
    // ==========================================================
    const RADIO_STREAM = "https://stream.zeno.fm/xx785t45mf9uv"; 


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
    // 4. CONTROLE DO PLAYER DE RÁDIO
    // ==========================================================
    const radioBtn = document.getElementById('radioBtn');
    const audioEl = document.getElementById('radioAudio');

    // Carregamento Turbo (Preload)
    if(audioEl){
        audioEl.src = RADIO_STREAM;
        audioEl.crossOrigin = "anonymous";
    }

    if(radioBtn && audioEl){
        radioBtn.addEventListener('click', () => {
            if(audioEl.paused){
                // --- DAR PLAY ---
                const playPromise = audioEl.play();
                if (playPromise !== undefined) {
                    playPromise.then(_ => {
                        updateInterface(true); // Sucesso
                    })
                    .catch(error => {
                        console.log("Erro no Play, reconectando...");
                        // Se falhar, recarrega o link e tenta de novo
                        audioEl.src = RADIO_STREAM;
                        audioEl.load();
                        audioEl.play();
                        updateInterface(true);
                    });
                }
            } else {
                // --- PAUSAR ---
                audioEl.pause();
                updateInterface(false);
            }
        });
    }

    // Atualiza o botão e avisa o CSS que está tocando
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