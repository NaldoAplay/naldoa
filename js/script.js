/* script.js - versão ajustada
   - Background interativo
   - Rádio player
   - Modal de reprodução de vídeos
   - Navegação interna
*/

// ====== CONFIGURAÇÃO ======
const RADIO_STREAM = "https://stream.zeno.fm/xx785t45mf9uv"; // seu stream

// ====== BACKGROUND INTERATIVO ======
const heroBg = document.querySelector('.hero-bg');
function onPointer(e){
  const p = e.touches ? e.touches[0] : e;
  const mx = (p.clientX / window.innerWidth - 0.5) * 18;
  const my = (p.clientY / window.innerHeight - 0.5) * 12;
  if(heroBg) heroBg.style.transform = `translate(${mx}px, ${my}px) scale(1.06)`;
}
window.addEventListener('pointermove', onPointer, {passive:true});
window.addEventListener('touchmove', onPointer, {passive:true});
window.addEventListener('resize', ()=> heroBg && (heroBg.style.transform = 'scale(1.03)'));

// ====== RADIO PLAYER ======
const radioBtn = document.getElementById('radioBtn');
const audioEl = document.getElementById('radioAudio');
if(audioEl){
  audioEl.src = RADIO_STREAM;
  audioEl.crossOrigin = "anonymous";
  audioEl.load();
}
let playing = false;
if(radioBtn){
  radioBtn.addEventListener('click', async () => {
    if(!audioEl) return;
    try {
      if(audioEl.paused){
        await audioEl.play();
        radioBtn.textContent = '⏸ NaldoA Play';
        radioBtn.setAttribute('aria-pressed','true');
        playing = true;
      } else {
        audioEl.pause();
        radioBtn.textContent = '▶ NaldoA Play';
        radioBtn.setAttribute('aria-pressed','false');
        playing = false;
      }
    } catch(e){
      console.warn('Playback blocked or error', e);
    }
  });
}

// ====== MODAL DE VÍDEOS ======
const modal = document.getElementById('videoModal');
const playerFrame = document.getElementById('playerFrame');
const closeBtn = document.querySelector('.modal-close');

function openModal(id){
  if(!modal || !playerFrame) return;
  playerFrame.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  history.pushState({modal:id}, '', '#video-'+id);
}

function closeModal(){
  if(!modal || !playerFrame) return;
  playerFrame.src = '';
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  history.back();
}

if(closeBtn) closeBtn.addEventListener('click', closeModal);
modal && modal.addEventListener('click', (e)=> { if(e.target === modal) closeModal(); });
window.addEventListener('popstate', ()=> { if(modal && modal.classList.contains('open')) closeModal(); });

// ====== EVENTO PARA TODOS OS VÍDEOS NO GRID ======
const videoGrid = document.getElementById('videoGrid');
if(videoGrid){
  videoGrid.querySelectorAll('.video-card iframe').forEach((iframe)=>{
    const parent = iframe.parentElement;
    const idMatch = iframe.src.match(/\/embed\/([a-zA-Z0-9_-]+)/);
    if(!idMatch) return;
    const id = idMatch[1];
    parent.style.cursor = 'pointer';
    parent.addEventListener('click', ()=> openModal(id));
  });
}

// ====== NAVEGAÇÃO INTERNA ======
document.querySelectorAll('.nav-btn, .hero-actions .btn').forEach(btn => {
  btn.addEventListener('click', (ev) => {
    const target = btn.dataset.section || btn.getAttribute('data-scroll');
    if(!target) return;
    const el = document.getElementById(target);
    if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
  });
});

// ====== BRAND CLIQUE VOLTA AO TOPO ======
document.getElementById('brandBtn')?.addEventListener('click', ()=> window.scrollTo({top:0,behavior:'smooth'}));
