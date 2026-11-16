/* Salon Schuster – Terminkarte & Terminbuch: Öffnungsstatus aus den belegten Zeiten (mit Mittagspause), heutiger Tag, Jetzt-Linie */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = $('#hours'); if (!el) return;
  const H = JSON.parse(el.textContent);
  const p = {}; new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', weekday: 'short', hour: 'numeric', minute: 'numeric', day: 'numeric', month: 'numeric', hour12: false }).formatToParts(new Date()).forEach(x => p[x.type] = x.value);
  const d = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[p.weekday], h = (+p.hour % 24) + (+p.minute) / 60;
  const f = v => { const a = Math.floor(v), m = Math.round((v - a) * 60); return a + (m ? ':' + String(m).padStart(2, '0') : '') + ' Uhr'; };
  const N = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const today = H[String(d)] || [];
  const cur = today.find(r => h >= r[0] && h < r[1]);
  let next = null;
  for (let k = 0; k < 8 && !next; k++) {
    const dd = (d + k) % 7, rs = H[String(dd)] || [];
    const r = rs.find(r => k > 0 || h < r[0]);
    if (r) next = { k, dd, t: r[0] };
  }
  const nextTxt = next ? (next.k === 0 ? 'heute ab ' : next.k === 1 ? 'morgen (' + N[next.dd] + ') ab ' : N[next.dd] + ' ab ') + f(next.t) : '';
  const status = cur ? '● Jetzt geöffnet – bis ' + f(cur[1]) : '● Gerade geschlossen' + (nextTxt ? ' – wieder ' + nextTxt : '');
  $$('[data-open],[data-status]').forEach(x => { x.textContent = x.hasAttribute('data-status') ? (cur ? '● Jetzt geöffnet' : '● Gerade geschlossen') : status; x.classList.add(cur ? 'is-open' : 'is-closed'); if (cur) x.classList.add('open'); });
  const nx = $('[data-next]');
  if (nx) { nx.textContent = cur ? 'jetzt – bis ' + f(cur[1]) : nextTxt; nx.classList.add('hand-in'); }
  const row = $('.wk-row[data-day="' + d + '"]'); if (row) row.classList.add('today');
  const now = $('.wk-now'), bar = row && $('.wk-bar', row), wk = $('.wk');
  const place = () => { if (!now || !bar || h < 8 || h > 18) return; const rb = bar.getBoundingClientRect(), rw = wk.getBoundingClientRect(); now.style.left = (rb.left - rw.left + rb.width * (h - 8) / 10) + 'px'; now.classList.add('on'); };
  place(); addEventListener('resize', place);
  // Terminkarte richtet sich zur Maus aus (nur feiner Zeiger, ohne reduzierte Bewegung)
  const card = $('[data-tilt]');
  if (card && matchMedia('(hover:hover) and (pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    card.addEventListener('pointermove', e => { const r = card.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(800px) rotate(-1.5deg) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`; });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  }
})();
