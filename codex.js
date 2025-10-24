
async function loadCodex() {
  try {
    const res = await fetch('codex.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('codex.json not found');
    const data = await res.json();
    const app = document.getElementById('app');
    if (!app) return;

    const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const el = (tag, attrs={}, html='') => { const n=document.createElement(tag); Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v)); if(html) n.innerHTML=html; return n; };
    const sectionTitle = (t) => `<div class="section-title"><h4>${t}</h4></div>`;

    if (path.includes('companies')) {
      app.innerHTML = sectionTitle('Companies · Order of Battle');
      data.companies.forEach(c => {
        const card = el('div', { class: 'card', style: 'grid-column: span 12' });
        const rows = c.elements.map(e => `<tr><th>${e.label}</th><td>${e.value}</td></tr>`).join('');
        card.innerHTML = `<h3>${c.name}</h3><p>${c.notes||''}</p><table><tr><th>Element</th><th>Details</th></tr>${rows}</table>`;
        app.appendChild(card);
      });
      return;
    }

    if (path.includes('armory')) {
      app.innerHTML = sectionTitle('Armory · Engines & Assets');
      const grid = el('div', { class: 'grid' });
      const addCard = (title, items, meta='') => {
        const card = el('div', { class: 'card' });
        const list = Array.isArray(items) ? `<p>${items.join('; ')}</p>` : `<p>${items}</p>`;
        card.innerHTML = `<h3>${title}</h3>${list}${meta?`<span class="meta">${meta}</span>`:''}`;
        grid.appendChild(card);
      };
      addCard('Transports', data.armory.transports, 'Ready/Queued');
      addCard('Artillery', data.armory.artillery, 'Deployed');
      addCard('Dreadnoughts', data.armory.dreadnoughts, 'Armory');
      const relics = el('div', { class: 'card', style: 'grid-column: span 12' });
      relics.innerHTML = `<h3>Relics & Wargear</h3><ul>${data.armory.relics.map(r=>`<li><strong>${r.name}</strong> — ${r.bearer} — ${r.notes}</li>`).join('')}</ul>`;
      grid.appendChild(relics);
      app.appendChild(grid);
      return;
    }

    if (path.includes('heroes')) {
      app.innerHTML = sectionTitle('Heroes of the Chapter');
      const grid = el('div', { class: 'grid' });
      data.heroes.forEach(h => {
        const card = el('div', { class: 'card' });
        card.innerHTML = `<h3>${h.name}</h3><p>${h.notes}</p><span class="meta">${h.tag||''}</span>`;
        grid.appendChild(card);
      });
      app.appendChild(grid);
      return;
    }

    if (path.includes('campaigns')) {
      app.innerHTML = sectionTitle('Campaign Dossiers');
      const grid = el('div', { class: 'grid' });
      data.campaigns.forEach(c => {
        const card = el('div', { class: 'card', style: 'grid-column: span 12' });
        card.innerHTML = `<h3>${c.name}</h3><p>${c.notes}</p><span class="meta">${c.tag||''}</span>`;
        grid.appendChild(card);
      });
      app.appendChild(grid);
      return;
    }

    if (path.includes('allies')) {
      app.innerHTML = sectionTitle('Allies of the XIII');
      const grid = el('div', { class: 'grid' });
      data.allies.forEach(a => {
        const card = el('div', { class: 'card' });
        card.innerHTML = `<h3>${a.name}</h3><p>${a.notes||''}</p>`;
        grid.appendChild(card);
      });
      app.appendChild(grid);
      return;
    }

    if (path.includes('enemies')) {
      app.innerHTML = sectionTitle('Enemies of the XIII');
      const grid = el('div', { class: 'grid' });
      data.enemies.forEach(e => {
        const card = el('div', { class: 'card' });
        card.innerHTML = `<h3>${e.name}</h3><p>${e.notes||''}</p><span class="meta">${e.models||''}</span>`;
        grid.appendChild(card);
      });
      app.appendChild(grid);
      return;
    }

    if (path.includes('relics')) {
      app.innerHTML = sectionTitle('Appendix: Relics');
      const table = el('table');
      table.innerHTML = `<tr><th>Name</th><th>Bearer</th><th>Notes</th></tr>` +
        data.armory.relics.map(r=>`<tr><td>${r.name}</td><td>${r.bearer}</td><td>${r.notes}</td></tr>`).join('');
      app.appendChild(table);
      return;
    }

    if (path.includes('gallery')) {
      app.innerHTML = sectionTitle('Illuminations');
      const grid = el('div', { class: 'grid' });
      if (!data.gallery.length) {
        const card = el('div', { class: 'card' });
        card.innerHTML = `<h3>Plates</h3><p>Add filenames to the "gallery" array in codex.json to render images.</p>`;
        grid.appendChild(card);
      } else {
        data.gallery.forEach(file => {
          const card = el('a', { class: 'card', href: file, target: '_blank' });
          card.innerHTML = `<h3>${file.split('/').pop()}</h3><p>Open image</p>`;
          grid.appendChild(card);
        });
      }
      app.appendChild(grid);
      return;
    }

  } catch (e) {
    console.warn('Codex manifest not loaded:', e);
  }
}
document.addEventListener('DOMContentLoaded', loadCodex);
