
async function loadCodex() {
  try {
    const res = await fetch('codex.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('codex.json not found');
    const data = await res.json();
    const app = document.getElementById('app');
    const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (!app) return;

    // Helper utilities
    const el = (tag, attrs={}, html='') => { const n=document.createElement(tag); for (const [k,v] of Object.entries(attrs)) n.setAttribute(k,v); if(html) n.innerHTML=html; return n; };
    const sectionTitle = (t) => `<div class="section-title"><h4>${t}</h4></div>`;

    // Companies
    if (path.includes('companies')) {
      app.innerHTML = sectionTitle('Companies · Order of Battle');
      data.companies.forEach(c => {
        const card = el('div', { class: 'card', style: 'grid-column: span 12' });
        const rows = (c.elements||[]).map(e => `<tr><th>${e.label}</th><td>${e.value}</td></tr>`).join('');
        card.innerHTML = `<h3>${c.name}</h3><p>${c.notes||''}</p><table><tr><th>Element</th><th>Details</th></tr>${rows}</table>`;
        app.appendChild(card);
      });
      return;
    }

    // Armory
    if (path.includes('armory')) {
      app.innerHTML = sectionTitle('Armory · Engines & Assets');
      const grid = el('div', { class: 'grid' });
      const addCard = (title, items, meta='') => {
        const card = el('div', { class: 'card' });
        const list = Array.isArray(items) ? `<p>${items.join('; ')}</p>` : `<p>${items||''}</p>`;
        card.innerHTML = `<h3>${title}</h3>${list}${meta?`<span class="meta">${meta}</span>`:''}`;
        grid.appendChild(card);
      };
      addCard('Transports', data.armory?.transports||[], 'Ready/Queued');
      addCard('Artillery', data.armory?.artillery||[], 'Deployed');
      addCard('Dreadnoughts', data.armory?.dreadnoughts||[], 'Armory');
      const relics = el('div', { class: 'card', style: 'grid-column: span 12' });
      relics.innerHTML = `<h3>Relics & Wargear</h3><ul>${(data.armory?.relics||[]).map(r=>`<li><strong>${r.name}</strong> — ${r.bearer} — ${r.notes||''}</li>`).join('')}</ul>`;
      grid.appendChild(relics);
      app.appendChild(grid);
      return;
    }

    // Heroes
    if (path.includes('heroes')) {
      app.innerHTML = sectionTitle('Heroes of the Chapter');
      const grid = el('div', { class: 'grid' });
      (data.heroes||[]).forEach(h => {
        const card = el('div', { class: 'card' });
        card.innerHTML = `<h3>${h.name}</h3><p>${h.notes||''}</p><span class="meta">${h.tag||''}</span>`;
        grid.appendChild(card);
      });
      app.appendChild(grid);
      return;
    }

    // Campaigns
    if (path.includes('campaigns')) {
      app.innerHTML = sectionTitle('Campaign Dossiers');
      const grid = el('div', { class: 'grid' });
      (data.campaigns||[]).forEach(c => {
        const card = el('div', { class: 'card', style: 'grid-column: span 12' });
        card.innerHTML = `<h3>${c.name}</h3><p>${c.notes||''}</p><span class="meta">${c.tag||''}</span>`;
        grid.appendChild(card);
      });
      app.appendChild(grid);
      return;
    }

    // Allies
    if (path.includes('allies')) {
      app.innerHTML = sectionTitle('Allies of the XIII');
      const grid = el('div', { class: 'grid' });
      (data.allies||[]).forEach(a => {
        const card = el('div', { class: 'card' });
        card.innerHTML = `<h3>${a.name}</h3><p>${a.notes||''}</p>`;
        grid.appendChild(card);
      });
      app.appendChild(grid);
      return;
    }

    // Enemies
    if (path.includes('enemies')) {
      app.innerHTML = sectionTitle('Enemies of the XIII');
      const grid = el('div', { class: 'grid' });
      (data.enemies||[]).forEach(e => {
        const card = el('div', { class: 'card' });
        card.innerHTML = `<h3>${e.name}</h3><p>${e.notes||''}</p><span class="meta">${e.models||''}</span>`;
        grid.appendChild(card);
      });
      app.appendChild(grid);
      return;
    }

    // Relics
    if (path.includes('relics')) {
      app.innerHTML = sectionTitle('Appendix: Relics');
      const table = el('table');
      const rows = (data.armory?.relics||[]).map(r=>`<tr><td>${r.name}</td><td>${r.bearer}</td><td>${r.notes||''}</td></tr>`).join('');
      table.innerHTML = `<tr><th>Name</th><th>Bearer</th><th>Notes</th></tr>${rows}`;
      app.appendChild(table);
      return;
    }

    // GALLERY with LIGHTBOX
    if (path.includes('gallery')) {
      app.innerHTML = sectionTitle('Illuminations');
      injectLightboxStyles();
      const grid = el('div', { class: 'grid' });
      const items = (data.gallery||[]).map(g => {
        if (typeof g === 'string') return { src: g, thumb: g, title: g.split('/').pop(), caption: '' };
        return { src: g.src, thumb: g.thumb || g.src, title: g.title || (g.src? g.src.split('/').pop() : ''), caption: g.caption || '' };
      });

      if (!items.length) {
        const card = el('div', { class: 'card' });
        card.innerHTML = `<h3>No plates yet</h3><p>Add image paths to the "gallery" array in <code>codex.json</code>. You can use strings or objects like {src, title, caption}.</p>`;
        grid.appendChild(card);
      } else {
        items.forEach((it, i) => {
          const card = el('a', { class: 'card', href: '#', 'data-index': i });
          card.innerHTML = `<h3>${escapeHtml(it.title)}</h3><p>${escapeHtml(it.caption)}</p><span class="meta">Open plate</span>`;
          card.addEventListener('click', (e) => { e.preventDefault(); openLightbox(i); });
          grid.appendChild(card);
        });
      }
      app.appendChild(grid);

      // Build lightbox overlay
      const overlay = el('div', { id: 'lb', role: 'dialog', 'aria-modal': 'true', style: 'display:none' });
      overlay.innerHTML = `
        <div class="lb-backdrop"></div>
        <figure class="lb-figure">
          <img id="lb-img" alt="Gallery plate"/>
          <figcaption id="lb-cap"></figcaption>
          <button class="lb-close" aria-label="Close">×</button>
          <button class="lb-prev" aria-label="Previous plate">‹</button>
          <button class="lb-next" aria-label="Next plate">›</button>
        </figure>`;
      document.body.appendChild(overlay);

      let idx = 0;
      function show(n){
        idx = (n + items.length) % items.length;
        const it = items[idx];
        const img = document.getElementById('lb-img');
        const cap = document.getElementById('lb-cap');
        img.src = it.src;
        img.onload = () => overlay.style.setProperty('--w', img.naturalWidth||0);
        cap.innerHTML = `<strong>${escapeHtml(it.title||'')}</strong>${it.caption? ' — ' + escapeHtml(it.caption): ''}`;
      }
      function openLightbox(n){
        if (!items.length) return;
        show(n);
        overlay.style.display = 'block';
        document.documentElement.style.overflow = 'hidden';
      }
      function closeLightbox(){
        overlay.style.display = 'none';
        document.documentElement.style.overflow = '';
      }
      function next(){ show(idx+1); }
      function prev(){ show(idx-1); }

      overlay.querySelector('.lb-close').addEventListener('click', closeLightbox);
      overlay.querySelector('.lb-next').addEventListener('click', next);
      overlay.querySelector('.lb-prev').addEventListener('click', prev);
      overlay.querySelector('.lb-backdrop').addEventListener('click', closeLightbox);
      window.addEventListener('keydown', (e)=>{
        if(overlay.style.display==='block'){
          if(e.key==='Escape') closeLightbox();
          if(e.key==='ArrowRight') next();
          if(e.key==='ArrowLeft') prev();
        }
      });

      return;
    }

  } catch (e) {
    console.warn('Codex manifest not loaded:', e);
  }
}

function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

function injectLightboxStyles(){
  if (document.getElementById('lb-styles')) return;
  const css = `
  /* Lightbox minimal styles - works on both dataslate and relic folios */
  #lb{position:fixed; inset:0; z-index:1000}
  #lb .lb-backdrop{position:absolute; inset:0; background:rgba(0,0,0,.75);}
  #lb .lb-figure{position:absolute; inset:6% 6%; display:grid; grid-template-rows: 1fr auto; align-items:center; justify-items:center; gap:12px}
  #lb img{max-width:100%; max-height:100%; border-radius:12px; box-shadow:0 12px 40px rgba(0,0,0,.6)}
  #lb figcaption{color:#e6eef9; font: 14px/1.4 system-ui,Segoe UI,Roboto; text-align:center}
  #lb .lb-close, #lb .lb-prev, #lb .lb-next{
    position:absolute; top:10px; width:40px; height:40px; border-radius:999px; border:none;
    color:#e6eef9; background:rgba(255,255,255,.12); cursor:pointer; font-size:22px;
    display:flex; align-items:center; justify-content:center; box-shadow:0 2px 12px rgba(0,0,0,.35);
  }
  #lb .lb-close{right:10px}
  #lb .lb-prev{left:10px; top:calc(50% - 20px)}
  #lb .lb-next{right:10px; top:calc(50% - 20px)}
  #lb .lb-close:hover, #lb .lb-prev:hover, #lb .lb-next:hover{background:rgba(255,255,255,.18)}
  `;
  const style = document.createElement('style'); style.id = 'lb-styles'; style.textContent = css; document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', loadCodex);
