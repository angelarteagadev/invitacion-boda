/* ========= UTIL: resolver extensión (.jpg/.jpeg/.JPG/.png) ========= */
function resolveImage(base){
  const exts=['.jpg','.jpeg','.JPG','.png'];
  return new Promise((res,rej)=>{
    (function next(i=0){
      if(i>=exts.length) return rej();
      const src=base+exts[i]+'?v='+Date.now();
      const img=new Image();
      img.onload=()=>res(src.replace(/\?v=\d+$/,''));
      img.onerror=()=>next(i+1);
      img.src=src;
    })();
  });
}

/* ========= WhatsApp RSVP (único botón) ========= */
const waBtn=document.getElementById('waBtn');
if(waBtn){
  const phone='5216142151613';
  const msg=encodeURIComponent('Hola, quiero confirmar mi asistencia a la boda de Ángel y Rebeca el 15 de noviembre. Mi nombre es: ');
  waBtn.href=`https://wa.me/${phone}?text=${msg}`;
}

/* ========= Cuenta regresiva ========= */
const targetDate=new Date('2025-11-15T17:30:00-07:00');
const cdEl=document.getElementById('countdown');
function pad(n){return String(n).padStart(2,'0')}
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

/* ========= Imágenes (detectando extensión) ========= */
// HERO 01
resolveImage('assets/galeria/01').then(src=>{
  const hero=document.querySelector('.hero'); if(hero) hero.style.backgroundImage=`url('${src}')`;
});
// Óvalo 02
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

/* ========= AUDIO CHIP (compacto dentro del papel) ========= */
(function(){
  const audio=document.getElementById('bgAudio'); if(!audio) return;

  // construir chip y anclarlo al final del .paper
  const chip=document.createElement('div');
  chip.className='audio-chip';
  chip.id='audioChip';
  chip.innerHTML=`
    <div class="acov" id="acov"></div>
    <div class="atxt"><div class="t">Ángel & Rebeca</div><div class="a">Nuestra canción</div></div>
    <button class="abtn play" id="aplay" aria-label="Reproducir/Pausar"><span class="ai"></span></button>
    <div class="aprog"><span id="apbar"></span></div>`;
  document.querySelector('.paper')?.appendChild(chip);
    // --- Posicionar el chip "dentro" del papel mientras haces scroll ---
  const paper = document.querySelector('.paper');

  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

  function positionAudioChip(){
    if(!paper || !chip) return;

    const m = 12; // margen interno respecto a los bordes del papel
    const rect = paper.getBoundingClientRect(); // papel relativo al viewport
    const ch   = chip.offsetHeight || 44;

    // ancho y left para que coincida con el papel
    const left  = Math.round(rect.left) + m;
    const width = Math.max(180, Math.round(rect.width) - m*2);

    // “pegar” al borde inferior del viewport, pero sin salirse del papel
    const desiredTop = window.innerHeight - m - ch;    // pegado al bottom del viewport
    const minTop     = Math.round(rect.top) + m;       // no subir más que el top del papel
    const maxTop     = Math.round(rect.bottom) - m - ch; // no bajar más que el bottom del papel
    const top        = clamp(desiredTop, minTop, maxTop);

    chip.style.left  = `${left}px`;
    chip.style.width = `${width}px`;
    chip.style.top   = `${top}px`;

    // Ocultar si el papel no está visible
    const visible = rect.bottom > 0 && rect.top < window.innerHeight;
    chip.style.visibility = visible ? 'visible' : 'hidden';
  }

  // Colocación inicial
  positionAudioChip();

  // Recolocar en scroll/resize (suavizado con rAF)
  let raf;
  const schedule = ()=>{ cancelAnimationFrame(raf); raf = requestAnimationFrame(positionAudioChip); };
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule);


  // portada = hero
  resolveImage('assets/galeria/01').then(src=>{ const c=document.getElementById('acov'); if(c) c.style.backgroundImage=`url('${src}')`; });

  const btn=document.getElementById('aplay');
  const bar=document.getElementById('apbar');

  const setBtn=p=>{ btn.classList.toggle('play',!p); btn.classList.toggle('pause',p); };
  const fade=(el,target=.5,step=.04,ms=70)=>{ let v=0; const t=setInterval(()=>{ v=Math.min(target,v+step); el.volume=v; if(v>=target) clearInterval(t); },ms); };

  // mostrar chip (sticky dentro del papel)
  // Autoplay responsable
  audio.volume=0; audio.muted=true;
  audio.play().then(()=>{ setTimeout(()=>{ audio.muted=false; fade(audio,.45); },250); setBtn(true); })
              .catch(()=>{ setBtn(false); /* con un tap en el chip se reproduce */ });

  // Toggle
  btn.addEventListener('click',e=>{
    e.stopPropagation();
    if(audio.paused){ audio.muted=false; if(audio.volume===0) audio.volume=.45; audio.play(); setBtn(true); }
    else { audio.pause(); setBtn(false); }
  });
  // Tap en el chip también juega/pausa (mobile friendly)
  chip.addEventListener('click',e=>{
    if(e.target===btn) return; // ya manejado arriba
    if(audio.paused){ audio.muted=false; if(audio.volume===0) audio.volume=.45; audio.play(); setBtn(true); }
    else { audio.pause(); setBtn(false); }
  });

  // Progreso
  audio.addEventListener('timeupdate',()=>{
    if(!isFinite(audio.duration)||audio.duration<=0) return;
    bar.style.width=((audio.currentTime/audio.duration)*100)+'%';
  });
})();
/* ===== Botón "Agregar a mi calendario" ===== */
(function(){
  const btn = document.getElementById('addCalBtn');
  if(!btn) return;

  // Datos del evento
  const title = 'Boda de Ángel & Rebeca';
  const location = 'La Huerta Eventos, C. 26 #801, Zarco, 31052 Chihuahua, Chih.';
// Reemplaza el details:
const details = `Ceremonia y celebración.

👗 Dress code
Mujeres: vestido midi o largo; tacón cómodo o wedge.
(Recomendamos llevar pashmina o saquito ligero por el clima fresco de la noche).
Hombres: traje oscuro, camisa formal; corbata opcional.

💛 Con cariño
Será una celebración solo para adultos (no habrá niños).

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

// Para ICS, preserva saltos de línea:
const detailsForICS = details.replace(/\n/g, '\\n');

  // Horarios en hora local Chihuahua (America/Ciudad_Juarez).
  // Para Google Calendar usamos UTC (Z) con la tz indicada; para .ics dejamos hora "flotante" + un header de zona.
  // 15 nov 2025 -> 18:00 a 23:30 locales. En UTC (aprox. MST, UTC-7): 01:00Z a 06:30Z del 16.
  const gStartUTC = '20251116T003000Z'; 
  const gEndUTC   = '20251116T063000Z';

  // 1) Enlace de Google Calendar
  const gcalUrl =
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent(title) +
    '&dates=' + gStartUTC + '/' + gEndUTC +
    '&details=' + encodeURIComponent(details) +
    '&location=' + encodeURIComponent(location) +
    '&ctz=' + encodeURIComponent('America/Ciudad_Juarez');

  // 2) Archivo ICS (Apple/Outlook/etc.)
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
DESCRIPTION:${details.replace(/\n/g,' ')}
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
    // Detección simple: Apple -> ICS, resto -> Google Calendar
    const ua = navigator.userAgent || '';
    const isApple = /iPhone|iPad|Macintosh/.test(ua);
    if (isApple) downloadICS();
    else window.open(gcalUrl, '_blank', 'noopener');
  });
})();
