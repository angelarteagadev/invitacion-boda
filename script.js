/* ========= Versión de assets para caché ========= */
const ASSET_VER = '1'; // súbelo a '2' cuando cambies fotos

/* ========= UTIL: resolver extensión (.jpg/.jpeg/.JPG/.png) ========= */
function resolveImage(base){
  const exts=['.jpg','.jpeg','.JPG','.png'];
  return new Promise((res,rej)=>{
    (function next(i=0){
      if(i>=exts.length) return rej();
      const src=base+exts[i]+'?v='+ASSET_VER;
      const img=new Image();
      img.onload=()=>res(src);
      img.onerror=()=>next(i+1);
      img.src=src;
    })();
  });
}

/* ========= Cuenta regresiva ========= */
const targetDate=new Date('2025-11-15T17:30:00-07:00');
const cdEl=document.getElementById('countdown');
const pad=n=>String(n).padStart(2,'0');
function renderCountdown(){
  if(!cdEl) return;
  const now=new Date();
  let diff=Math.max(0,targetDate-now);
  const d=Math.floor(diff/86400000); diff-=d*86400000;
  const h=Math.floor(diff/3600000);  diff-=h*3600000;
  const m=Math.floor(diff/60000);    diff-=m*60000;
  const s=Math.floor(diff/1000);
  cdEl.innerHTML=`
    <div class="tick"><strong>${pad(d)}</strong><span>días</span></div>
    <div class="tick"><strong>${pad(h)}</strong><span>horas</span></div>
    <div class="tick"><strong>${pad(m)}</strong><span>min</span></div>
    <div class="tick"><strong>${pad(s)}</strong><span>seg</span></div>`;
}
renderCountdown(); setInterval(renderCountdown,1000);

/* ========= Reveal & Parallax ========= */
const io=new IntersectionObserver(es=>{
  es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in-view'); io.unobserve(e.target);} });
},{threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
function parallax(){ const y=window.scrollY; document.querySelectorAll('.parallax').forEach(el=>{ el.style.backgroundPosition=`center calc(50% + ${Math.round(y*0.06)}px)`; }); }
parallax(); window.addEventListener('scroll',parallax,{passive:true});

/* ========= Imágenes ========= */
// HERO 01
resolveImage('assets/galeria/01').then(src=>{
  const hero=document.querySelector('.hero'); if(hero) hero.style.backgroundImage=`url('${src}')`;
});
// Óvalo 15
resolveImage('assets/galeria/15').then(src=>{
  const win=document.querySelector('.window'); if(win) win.style.backgroundImage=`url('${src}')`;
});
// Galería 03..14
(function(){
  const cont=document.getElementById('gallery'); if(!cont) return;
  for(let i=3;i<=14;i++){
    const base='assets/galeria/'+String(i).padStart(2,'0');
    resolveImage(base).then(src=>{
      const fig=document.createElement('figure');
      const img=document.createElement('img');
      img.loading='lazy'; img.decoding='async'; img.src=src; img.alt='Foto — Ángel & Rebeca';
      img.addEventListener('click',()=>openLightbox(img.src,img.alt));
      fig.appendChild(img); cont.appendChild(fig);
    }).catch(()=>{});
  }
})();

/* ========= Lightbox ========= */
let lb;
function openLightbox(src,alt){
  if(!lb){
    lb=document.createElement('div');
    lb.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;z-index:80;padding:18px;cursor:zoom-out';
    const img=document.createElement('img');
    img.style.maxWidth='96%'; img.style.maxHeight='92%'; img.style.boxShadow='0 20px 60px rgba(0,0,0,.6)';
    img.alt=''; lb.appendChild(img);
    lb.addEventListener('click',()=>document.body.removeChild(lb));
    document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&lb.parentNode){ document.body.removeChild(lb); }});
  }
  lb.querySelector('img').src=src; lb.querySelector('img').alt=alt||'';
  document.body.appendChild(lb);
}

/* ========= AUDIO CHIP ========= */
(function(){
  const audio=document.getElementById('bgAudio'); if(!audio) return;

  // chip
  const chip=document.createElement('div');
  chip.className='audio-chip'; chip.id='audioChip';
  chip.innerHTML=`
    <div class="acov" id="acov"></div>
    <div class="atxt"><div class="t">Ángel & Rebeca</div><div class="a">Nuestra canción</div></div>
    <button class="abtn play" id="aplay" aria-label="Reproducir/Pausar"><span class="ai"></span></button>
    <div class="aprog"><span id="apbar"></span></div>`;
  document.querySelector('.paper')?.appendChild(chip);

  const paper = document.querySelector('.paper');
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

  function positionAudioChip(){
    if(!paper || !chip) return;
    const m=12, rect=paper.getBoundingClientRect(), ch=chip.offsetHeight||44;
    const left=Math.round(rect.left)+m;
    const width=Math.max(180, Math.round(rect.width)-m*2);
    const desiredTop=window.innerHeight - m - ch;
    const minTop=Math.round(rect.top)+m;
    const maxTop=Math.round(rect.bottom)-m - ch;
    const top=clamp(desiredTop,minTop,maxTop);
    chip.style.left=`${left}px`; chip.style.width=`${width}px`; chip.style.top=`${top}px`;
    const visible = rect.bottom > 0 && rect.top < window.innerHeight;
    chip.style.visibility = visible ? 'visible' : 'hidden';
  }
  positionAudioChip();
  let raf; const schedule=()=>{ cancelAnimationFrame(raf); raf=requestAnimationFrame(positionAudioChip); };
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule);

  // portada para la miniatura
  resolveImage('assets/galeria/01').then(src=>{ const c=document.getElementById('acov'); if(c) c.style.backgroundImage=`url('${src}')`; });

  const btn=document.getElementById('aplay');
  const bar=document.getElementById('apbar');
  const setBtn=p=>{ btn.classList.toggle('play',!p); btn.classList.toggle('pause',p); };
  const fade=(el,target=.5,step=.04,ms=70)=>{ let v=0; const t=setInterval(()=>{ v=Math.min(target,v+step); el.volume=v; if(v>=target) clearInterval(t); },ms); };

  audio.volume=0; audio.muted=true;
  audio.play().then(()=>{ setTimeout(()=>{ audio.muted=false; fade(audio,.45); },250); setBtn(true); })
              .catch(()=>{ setBtn(false); });

  btn.addEventListener('click',e=>{
    e.stopPropagation();
    if(audio.paused){ audio.muted=false; if(audio.volume===0) audio.volume=.45; audio.play(); setBtn(true); }
    else { audio.pause(); setBtn(false); }
  });
  chip.addEventListener('click',e=>{
    if(e.target===btn) return;
    if(audio.paused){ audio.muted=false; if(audio.volume===0) audio.volume=.45; audio.play(); setBtn(true); }
    else { audio.pause(); setBtn(false); }
  });

  audio.addEventListener('timeupdate',()=>{
    if(!isFinite(audio.duration)||audio.duration<=0) return;
    bar.style.width=((audio.currentTime/audio.duration)*100)+'%';
  });
})();

/* ===== Botón "Agregar a mi calendario" ===== */
(function(){
  const btn = document.getElementById('addCalBtn');
  if(!btn) return;

  const title = 'Boda de Ángel & Rebeca';
  const location = 'La Huerta Eventos, C. 26 #801, Zarco, 31052 Chihuahua, Chih.';
  const details = `Ceremonia y celebración.

👗 Dress code
Mujeres: vestido midi o largo; tacón cómodo o wedge.
(Recomendamos llevar pashmina o saquito ligero por el clima fresco de la noche).
Hombres: traje oscuro, camisa formal; corbata opcional.

💛 Con cariño
Será una celebración solo para adultos.

📋 Itinerario
17:30–18:00  Llegada de invitados · tragos de bienvenida · música suave
18:00–18:40  Ceremonia civil con juez · votos con MC
18:40–18:50  Fotos rápidas post-ceremonia
18:50–19:30  Cena
19:30–20:20  Juegos y dinámicas con invitados
20:20–20:30  Preparación para el baile
20:30–20:40  Vals de novios
20:40–23:20  Fiesta y baile
23:20–23:30  Última canción · despedida

Por favor llegar 15 minutos antes.`;

  const detailsForICS = details.replace(/\n/g,'\\n');

  // 15 nov 2025 -> 17:30 a 23:30 locales (America/Ciudad_Juarez).
  // En UTC: 00:30Z a 06:30Z del 16.
  const gStartUTC = '20251116T003000Z';
  const gEndUTC   = '20251116T063000Z';

  const gcalUrl =
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent(title) +
    '&dates=' + gStartUTC + '/' + gEndUTC +
    '&details=' + encodeURIComponent(details) +
    '&location=' + encodeURIComponent(location) +
    '&ctz=' + encodeURIComponent('America/Ciudad_Juarez');

  const ics =
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Invitacion Boda//angel-rebeca//ES
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Boda Ángel y Rebeca
X-WR-TIMEZONE:America/Ciudad_Juarez
BEGIN:VEVENT
UID:${crypto.randomUUID ? crypto.randomUUID() : ('uid-'+Date.now())}@invitacion-boda
SUMMARY:${title}
DTSTART:20251115T173000
DTEND:20251115T233000
DESCRIPTION:${detailsForICS}
LOCATION:${location}
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Recordatorio: Boda de Ángel & Rebeca en 1 hora
END:VALARM
END:VEVENT
END:VCALENDAR`;

  function downloadICS(){
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = 'Boda-Angel-Rebeca.ics';
    a.href = url;
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 0);
  }

  btn.addEventListener('click', (e)=>{
    e.preventDefault();
    const ua = navigator.userAgent || '';
    const isApple = /iPhone|iPad|Macintosh/.test(ua);
    if (isApple) downloadICS();
    else window.open(gcalUrl, '_blank', 'noopener');
  });
})();

/* ========= Regalos: copiar CLABE/datos ========= */
(function(){
  const btnClabe = document.getElementById('copyClabeBtn');
  const btnAll   = document.getElementById('copyAllBtn');
  if(!btnClabe && !btnAll) return;

  const clabe = (document.getElementById('clabeText')?.textContent || '').replace(/\s+/g,'');
  const bank  = document.getElementById('bankName')?.textContent || '';
  const recip = document.getElementById('recipientName')?.textContent || '';

  function toast(msg){
    let t=document.getElementById('toast');
    if(!t){ t=document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t); }
    t.textContent=msg;
    t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'),1500);
  }
  async function copy(text){
    try{ await navigator.clipboard.writeText(text); toast('Copiado ✅'); }
    catch(e){
      // Fallback
      const ta=document.createElement('textarea'); ta.value=text; document.body.appendChild(ta);
      ta.select(); document.execCommand('copy'); ta.remove(); toast('Copiado ✅');
    }
  }

  btnClabe?.addEventListener('click', ()=> copy(btnClabe.dataset.copy || clabe));
  btnAll?.addEventListener('click', ()=>{
    const full = `CLABE: ${clabe}\nTitular: ${recip}\nBanco: ${bank}\nConcepto: Boda Ángel & Rebeca`;
    copy(full);
  });
})();
/* ========= Toggle de tema claro/oscuro ========= */
(function(){
  const btn = document.getElementById('themeToggle');
  const root = document.documentElement;
  if(!btn) return;

  // Preferencia guardada o sistema
  const saved = localStorage.getItem('theme');
  if(saved){
    root.setAttribute('data-theme', saved);
    btn.textContent = saved==='dark' ? '☀️' : '🌙';
  }else{
    const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    btn.textContent = prefersDark ? '☀️' : '🌙';
  }

  btn.addEventListener('click', ()=>{
    const cur = root.getAttribute('data-theme') || 'light';
    const next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    btn.textContent = next==='dark' ? '☀️' : '🌙';
  });
})();
