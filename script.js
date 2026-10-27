// MADx marketing site behaviour. No dependencies.

// ---- Demo form destination -------------------------------------------------
// Set ONE of these before going live:
//   DEMO_ENDPOINT: a form service URL that accepts a POST (Formspree, Basin, your own server).
//   DEMO_EMAIL:    an address; the visitor's mail app opens with the request filled in.
// If both are set, the endpoint is used.
const DEMO_ENDPOINT = '';
const DEMO_EMAIL = '';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- Hero constellation ----------------------------------------------------
// Positions are percentages of the square. Active Directory sits alone at the top; every other
// system is one of six rows, mirrored left (on-prem, teal) and right (cloud, violet), so the
// graphic is symmetrical by construction. `off` is each row's distance from the centre line,
// following an ellipse around the core. Every node has its own angle, so no spoke runs under
// another label or along another spoke. Labels are placed by length: the widest rows (top and
// the middle of the sides have the least room) get the shortest names. Checked for collisions
// from 320px phones up (offsets found by a search over the rendered labels); re-check if you
// rename or reorder.
const TOP = { label: 'Active Directory', kind: 'onprem' };
const ROWS = [
  { y: 18, off: 24,   left: 'File shares',  right: 'Google Workspace' },
  { y: 32, off: 34.5, left: 'HR system',    right: 'Entra ID' },
  { y: 46, off: 36,   left: 'DHCP',         right: 'Intune' },
  { y: 60, off: 36,   left: 'Printers',     right: 'OneDrive' },
  { y: 74, off: 30.5, left: 'AI assistant', right: 'PowerSchool' },
  { y: 89, off: 12,   left: 'DNS',          right: 'Mosyle' },
];
// Clockwise from the top, so the draw-in sweeps round the ring.
const NODES = [
  { label: TOP.label, x: 50, y: 5, kind: TOP.kind },
  ...ROWS.map((r) => ({ label: r.right, x: 50 + r.off, y: r.y, kind: 'cloud' })),
  ...ROWS.slice().reverse().map((r) => ({ label: r.left, x: 50 - r.off, y: r.y, kind: 'onprem' })),
];

// The core is 30% of the square wide (see .core), so lines stop at radius 15: they reach the
// bubble's edge instead of showing through its glass.
const CORE_R = 15;

function buildConstellation() {
  const host = document.querySelector('.constellation');
  if (!host) return;
  const svg = host.querySelector('.constellation-lines');
  const NS = 'http://www.w3.org/2000/svg';

  // One faint, solid halo between the core and the nodes.
  const halo = document.createElementNS(NS, 'circle');
  halo.setAttribute('class', 'ring');
  halo.setAttribute('cx', '50'); halo.setAttribute('cy', '50'); halo.setAttribute('r', '23');
  halo.setAttribute('stroke-width', '0.25');
  svg.appendChild(halo);

  const pulses = [];
  NODES.forEach((n, i) => {
    const color = n.kind === 'cloud' ? '154,140,232' : '56,214,190';
    // A straight spoke from the node to the core's edge. Straight, not curved: any bend pushes
    // half the diagonal spokes toward a neighbouring label on small phones.
    const dx = 50 - n.x, dy = 50 - n.y;
    const dist = Math.hypot(dx, dy);
    const ex = 50 - (dx / dist) * CORE_R, ey = 50 - (dy / dist) * CORE_R;
    const d = `M ${n.x} ${n.y} L ${ex.toFixed(2)} ${ey.toFixed(2)}`;

    const path = document.createElementNS(NS, 'path');
    path.setAttribute('class', 'link');
    path.setAttribute('d', d);
    path.setAttribute('pathLength', '1');
    path.setAttribute('stroke', `rgba(${color},0.62)`);
    path.style.setProperty('--d', `${0.15 + i * 0.06}s`);
    // The draw-in uses a dash pattern; once drawn, drop it so rounding can't leave a hairline gap.
    path.addEventListener('animationend', () => { path.style.strokeDasharray = 'none'; }, { once: true });
    path.id = `link-${i}`;
    svg.appendChild(path);

    // Pulses travel from each system into MADx, staggered so they never fire in unison.
    if (!reduceMotion) {
      const dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('class', 'pulse');
      dot.setAttribute('r', '0.75');
      dot.setAttribute('fill', `rgb(${color})`);
      dot.style.filter = `drop-shadow(0 0 1.2px rgb(${color}))`;
      const motion = document.createElementNS(NS, 'animateMotion');
      motion.setAttribute('dur', `${3.2 + (i % 4) * 0.7}s`);
      motion.setAttribute('begin', `${1.4 + i * 0.37}s`);
      motion.setAttribute('repeatCount', 'indefinite');
      motion.setAttribute('keyPoints', '0;1');
      motion.setAttribute('keyTimes', '0;1');
      motion.setAttribute('calcMode', 'spline');
      motion.setAttribute('keySplines', '0.5 0 0.2 1');
      const mpath = document.createElementNS(NS, 'mpath');
      mpath.setAttribute('href', `#link-${i}`);
      motion.appendChild(mpath);
      dot.appendChild(motion);
      // Hidden until its own motion begins; otherwise it waits at the SVG origin.
      dot.setAttribute('opacity', '0');
      const show = document.createElementNS(NS, 'set');
      show.setAttribute('attributeName', 'opacity');
      show.setAttribute('to', '1');
      show.setAttribute('begin', motion.getAttribute('begin'));
      dot.appendChild(show);
      pulses.push(dot);
    }

    const pill = document.createElement('span');
    pill.className = `node${n.kind === 'cloud' ? ' is-cloud' : ''}`;
    pill.textContent = n.label;
    pill.style.left = `${n.x}%`;
    pill.style.top = `${n.y}%`;
    pill.style.setProperty('--d', `${0.35 + i * 0.06}s`);
    host.appendChild(pill);
  });

  pulses.forEach((p) => svg.appendChild(p));
}

// ---- Mobile nav ------------------------------------------------------------
function setupNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.getElementById('nav-links');
  if (!toggle || !links) return;
  const close = () => { toggle.setAttribute('aria-expanded', 'false'); links.classList.remove('is-open'); };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    links.classList.toggle('is-open', open);
  });
  links.addEventListener('click', (e) => { if (e.target.closest('a')) close(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links.classList.contains('is-open')) { close(); toggle.focus(); }
  });
}

// ---- Tools tabs (WAI-ARIA tabs pattern, automatic activation) -------------
function setupTabs() {
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  if (!tabs.length) return;

  const select = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !on;
      if (on) {
        panel.classList.remove('is-entering');
        void panel.offsetWidth; // restart the entrance animation
        panel.classList.add('is-entering');
      }
    });
    if (focus) tab.focus();
    tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab, false));
    tab.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); select(next, true); }
    });
  });
}

// ---- Screenshots -----------------------------------------------------------
// To show a real screenshot instead of the drawn mock, save it in assets/screens/ and add
// data-src="assets/screens/<file>" to that tab's <figure class="shot"> in index.html.
// If the file can't be loaded, the mock stays.
function setupScreens() {
  document.querySelectorAll('.shot[data-src]').forEach((fig) => {
    const panel = fig.closest('[role="tabpanel"]');
    const heading = panel ? panel.querySelector('h3') : null;
    const img = new Image();
    img.onload = () => {
      const name = heading ? heading.textContent : fig.dataset.screen;
      img.alt = `MADx screen: ${name}`;
      img.width = img.naturalWidth; img.height = img.naturalHeight;
      img.decoding = 'async';
      // The app's text is small at tab width, so the image opens full size in a new tab.
      const link = document.createElement('a');
      link.href = fig.dataset.src;
      link.target = '_blank';
      link.rel = 'noopener';
      link.className = 'shot-link';
      link.setAttribute('aria-label', `Open the ${name} screenshot full size in a new tab`);
      link.appendChild(img);
      fig.replaceChildren(link);
    };
    img.src = fig.dataset.src;
  });
}

// ---- Demo form -------------------------------------------------------------
function setupForm() {
  const form = document.getElementById('demo-form');
  if (!form) return;
  const status = document.getElementById('form-status');
  const submit = form.querySelector('button[type="submit"]');
  const required = [
    { input: form.elements.name, error: document.getElementById('e-name'), ok: (v) => v.trim().length > 0 },
    { input: form.elements.email, error: document.getElementById('e-email'), ok: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
    { input: form.elements.district, error: document.getElementById('e-district'), ok: (v) => v.trim().length > 0 },
  ];

  const check = (f) => {
    const valid = f.ok(f.input.value);
    f.input.setAttribute('aria-invalid', String(!valid));
    f.error.hidden = valid;
    return valid;
  };
  // Validate on blur, then live once a field has shown an error.
  required.forEach((f) => {
    f.input.addEventListener('blur', () => { if (f.input.value) check(f); });
    f.input.addEventListener('input', () => { if (f.input.getAttribute('aria-invalid') === 'true') check(f); });
  });

  const setStatus = (text, kind) => {
    status.textContent = text;
    status.className = `form-status${kind ? ` is-${kind}` : ''}`;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const bad = required.filter((f) => !check(f));
    if (bad.length) { bad[0].input.focus(); setStatus('', ''); return; }

    const data = Object.fromEntries(new FormData(form).entries());

    if (DEMO_ENDPOINT) {
      submit.disabled = true;
      const label = submit.textContent;
      submit.textContent = 'Sending request';
      try {
        const res = await fetch(DEMO_ENDPOINT, {
          method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form),
        });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        setStatus(`Request sent. We'll reply to ${data.email} to set up a time.`, 'ok');
      } catch {
        setStatus("Your request didn't send. Check your connection and try again.", 'error');
      } finally {
        submit.disabled = false;
        submit.textContent = label;
      }
      return;
    }

    if (DEMO_EMAIL) {
      const body = [
        `Name: ${data.name}`, `Email: ${data.email}`, `District: ${data.district}`,
        `Role: ${data.role || ''}`, `District size: ${data.size || ''}`, '', data.message || '',
      ].join('\n');
      window.location.href = `mailto:${DEMO_EMAIL}?subject=${encodeURIComponent(`MADx demo request: ${data.district}`)}&body=${encodeURIComponent(body)}`;
      setStatus('Your email app should open with the request filled in. Press send there to finish.', 'ok');
      return;
    }

    setStatus("Demo requests aren't connected yet. Please check back soon.", 'error');
  });
}

document.getElementById('year').textContent = String(new Date().getFullYear());
buildConstellation();
setupNav();
setupTabs();
setupScreens();
setupForm();
