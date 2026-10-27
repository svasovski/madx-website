// MADx guided tour: a clickable walkthrough of the app, with made-up people and devices.
// Self-contained (no dependencies, nothing sent anywhere), so it can be embedded on any page:
//
//   <link rel="stylesheet" href="tour.css">
//   <div data-madx-tour data-demo-href="#demo"></div>
//   <script src="tour.js" defer></script>
//
// data-demo-href is where the closing "Request a demo" button points.
// Each stop is a list of steps. A step draws one screen of the app (view), optionally a dialog
// and a toast, and names the control to click next (target, matched against data-t). Steps
// with `auto` move on by themselves after that many milliseconds (progress screens).
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Icons (24px grid, stroked) -------------------------------------------
  const ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    back: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    sync: '<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8"/><path d="M4 3v5h5"/><path d="M4 13a8 8 0 0 0 14.3 4.9L20 16"/><path d="M20 21v-5h-5"/>',
    pin: '<path d="M9 4h6l-1 6 3 3H7l3-3z"/><path d="M12 13v7"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M10.8 12.2L20 3M16 7l3 3M14 9l2 2"/>',
    unlock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
    ipad: '<rect x="5" y="2.5" width="14" height="19" rx="2"/><path d="M11 18.5h2"/>',
    laptop: '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>',
    cloud: '<path d="M7 18a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 9.5a4 4 0 0 1-.5 8.5z"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    bot: '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01M9.5 16.5h5"/>',
    printer: '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
    log: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    chevron: '<path d="M9 6l6 6-6 6"/>',
    sound: '<path d="M4 10v4h4l5 4V6L8 10z"/><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11"/>',
    location: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16h.01"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 0 0 5 5l-8.4 8.4a2.1 2.1 0 0 1-3-3z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    send: '<path d="M4 12l16-8-6 16-3-7z"/>',
    signin: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l5-5-5-5M15 12H3"/>',
    pulse: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.5a5 5 0 0 1 5.5 5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    network: '<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M6 16v-2h12v2"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    swap: '<path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
  };
  const ic = (name) => `<svg class="t-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;

  // ---- Building blocks (class names mirror the app's own components) --------
  const clock = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const mono = (s) => `<span class="t-mono">${s}</span>`;
  const pill = (text, tone = '') => `<span class="t-pill${tone ? ` t-${tone}` : ''}">${text}</span>`;
  const chip = (text, tone = 'neutral') => `<span class="t-chip t-chip-${tone}">${text}</span>`;

  const btn = (label, o = {}) => `<button type="button" class="t-btn${o.kind ? ` t-btn-${o.kind}` : ''}${o.sm ? ' t-btn-sm' : ''}"${o.t ? ` data-t="${o.t}"` : ''}${o.disabled ? ' disabled' : ''}>${o.icon ? ic(o.icon) : ''}<span>${label}</span></button>`;

  const head = (icon, title, intro, tabs, on = 0) => `
    <div class="t-head">
      <div class="t-head-top"><span class="t-head-icon">${ic(icon)}</span><h4>${title}</h4>
        <button type="button" class="t-pin">${ic('pin')}<span>Pin to Overview</span></button></div>
      <p>${intro}</p>
    </div>
    ${tabs ? `<div class="t-tabs">${tabs.map((t, i) => `<span${i === on ? ' class="is-on"' : ''}>${t}</span>`).join('')}</div>` : ''}`;

  const stats = (items) => `<div class="t-stats">${items.map(([v, c, tone]) =>
    `<div class="t-stat"><b${tone ? ` class="t-${tone}"` : ''}>${v}</b><span>${c}</span></div>`).join('')}</div>`;

  const card = (title, body, o = {}) => `
    <section class="t-card${o.cls ? ` ${o.cls}` : ''}">
      <header class="t-card-head"><h5>${title}</h5>${o.count != null ? `<span class="t-count${o.tone ? ` t-${o.tone}` : ''}">${o.count}</span>` : ''}${o.note ? `<span class="t-note">${o.note}</span>` : ''}</header>
      ${body}
    </section>`;

  const kv = (rows) => `<dl class="t-kv">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;

  const fields = (rows) => `<div class="t-fields">${rows.map(([label, attr, value]) =>
    `<div class="t-field"><div class="t-field-label"><span>${label}</span><code>${attr}</code></div><div class="t-input">${value}</div></div>`).join('')}</div>`;

  // CSS-grid table. `hide` lists column indexes dropped when the app is narrow, `sm` is the
  // column template used then. Rows with `t` are buttons the tour can point at.
  const table = ({ cols, sm, hide = [], headings, rows }) => {
    const cells = (list) => list.map((c, i) => `<span${hide.includes(i) ? ' class="t-sm-hide"' : ''}>${c}</span>`).join('');
    return `<div class="t-table" style="--cols:${cols}${sm ? `;--cols-sm:${sm}` : ''}">
      <div class="t-tr t-th">${cells(headings)}</div>
      ${rows.map((r) => (r.t
        ? `<button type="button" class="t-tr${r.selected ? ' is-selected' : ''}" data-t="${r.t}">${cells(r.cells)}</button>`
        : `<div class="t-tr${r.selected ? ' is-selected' : ''}">${cells(r.cells)}</div>`)).join('')}
    </div>`;
  };

  const toggle = (label, note, on, role = 'switch') => `
    <button type="button" role="${role}" aria-checked="${on}" class="t-switchrow t-${role}">
      <span class="t-${role}-mark" aria-hidden="true"></span>
      <span><strong>${label}</strong>${note ? `<small>${note}</small>` : ''}</span>
    </button>`;

  const dialog = (title, body, actions) => `
    <div class="t-dialog" role="dialog" aria-label="${title}">
      <h5>${title}</h5>
      <div class="t-dialog-body">${body}</div>
      <div class="t-dialog-actions">${actions}</div>
    </div>`;

  // Segmented control. `targets` maps a segment's label to the data-t the tour can point at.
  const segbar = (items, on, targets = {}) => `<div class="t-segbar">${items.map((s) => (targets[s]
    ? `<button type="button" class="${s === on ? 'is-on' : ''}" data-t="${targets[s]}">${s}</button>`
    : `<span${s === on ? ' class="is-on"' : ''}>${s}</span>`)).join('')}</div>`;
  const tick = (on) => `<span class="t-tick${on ? ' is-on' : ''}" aria-label="${on ? 'Selected' : 'Not selected'}"></span>`;
  const member = pill(`${ic('check')}Member`, 'ok');
  const foot = (left, right) => `<div class="t-foot"><p>${left}</p><div class="t-btns">${right}</div></div>`;
  const searchbox = (text) => `<div class="t-searchbox">${ic('search')}<span>${text}</span></div>`;
  const run = (title, text, ms) => `
    <div class="t-card t-run">
      <h5>${title}</h5><p>${text}</p>
      <div class="t-progress"><i style="--dur:${ms}ms"></i></div>
      <div class="t-btns">${btn('Cancel run', { sm: true })}</div>
    </div>`;
  const result = (title, text, tone = 'ok') => `
    <div class="t-result t-result-${tone}">${ic(tone === 'ok' ? 'check' : 'alert')}<div><h5>${title}</h5><p>${text}</p></div></div>`;

  // ---- Accounts --------------------------------------------------------------
  const overview = () => `
    ${head('home', 'Overview', 'Your district at a glance. Search for anyone from the bar at the top.')}
    <div class="t-body">
      ${stats([['4', 'Locked out', 'warn'], ['12', 'Passwords expiring this week'], ['16', 'HR changes waiting'], ['38', 'Devices not seen in 14+ days', 'warn']])}
      <div class="t-callout"><span class="t-callout-tag">Phone message · 7:41 AM</span>
        <p><b>Jordan Ellis</b>, 3rd grade, Lincoln Elementary: "I'm locked out and the bell rings in 15 minutes."</p></div>
      ${card('Recently viewed', table({
        cols: '1.4fr 1fr 1.4fr', sm: '1fr 1fr', hide: [2],
        headings: ['Name', 'Type', 'Location'],
        rows: [
          { cells: ['<b>Avery Chen</b>', 'Staff', 'Hill Middle'] },
          { cells: [mono('HMS-LT-2291'), 'Laptop', 'Hill Middle'] },
          { cells: ['<b>Sam Ortiz</b>', 'Staff', 'Oak Elementary'] },
        ],
      }), { cls: 't-card-flush' })}
    </div>`;

  const results = () => `
    <div class="t-user">
      <span class="t-back">${ic('back')}Overview</span>
      <h4 class="t-results-title">Results for "jellis"</h4>
      <div class="t-filters">${pill('Users 1', 'ok')}${pill('Devices 2')}<span class="t-filter-sep"></span>
        ${['Staff', 'Students', 'Locked out', 'Disabled', 'Cloud-only'].map((f) => `<span class="t-filter">${f}</span>`).join('')}</div>
    </div>
    <div class="t-body">
      <p class="t-section-title">Users</p>
      ${table({
        cols: '1.3fr .9fr 1.6fr 1.3fr 1fr', sm: '1.3fr 1fr auto', hide: [2, 3],
        headings: ['Display name', 'Username', 'Email', 'Location', 'Status'],
        rows: [{ t: 'open-user', cells: ['<b>Jordan Ellis</b>', mono('jellis'), mono('jellis@district.org'), 'Lincoln Elementary', pill('Locked out', 'warn')] }],
      })}
      <p class="t-section-title">Devices</p>
      ${table({
        cols: '1.3fr 1fr 1fr 1fr', sm: '1.3fr 1fr', hide: [2, 3],
        headings: ['Device', 'Type', 'Managed by', 'Last seen'],
        rows: [
          { cells: [mono('LES-LT-2214'), 'Windows laptop', 'Intune', '2 hours ago'] },
          { cells: [mono('LES-IPAD-T031'), 'iPad', 'Mosyle', 'Yesterday'] },
        ],
      })}
    </div>`;

  const jordan = (locked) => `
    <div class="t-user">
      <span class="t-back">${ic('back')}Overview</span>
      <div class="t-user-id">
        <span class="t-avatar">JE</span>
        <div>
          <div class="t-user-name"><h4>Jordan Ellis</h4>${locked ? pill('Locked out', 'warn') : pill('Enabled', 'ok')}${pill('Staff')}</div>
          <p class="t-sub">${mono('jellis')}${mono('jellis@district.org')}</p>
        </div>
      </div>
    </div>
    <div class="t-bar">
      <div class="t-btns">
        ${btn('Reset password', { kind: 'primary', icon: 'key', t: 'reset' })}
        ${btn('Unlock', { kind: locked ? 'warn' : '', icon: 'unlock', disabled: !locked })}
        ${btn('Force AAD sync', { icon: 'sync' })}
        ${btn('Move to OU')}
        ${btn('Disable', { kind: 'danger' })}
      </div>
      <p class="t-meta"><span>OU ${mono('Staff/Lincoln/Teachers')}</span><span>Last logon <b>Today 7:12 AM</b></span>
        <span>Password set <b>${locked ? '8/14/2026' : `Today ${clock()}`}</b></span><span>On-prem AD, synced to Entra ID</span></p>
    </div>
    <div class="t-body t-cols">
      ${card('Attributes', fields([
        ['First name', 'givenName', 'Jordan'], ['Last name', 'sn', 'Ellis'],
        ['Title', 'title', '3rd grade teacher'], ['Department', 'department', 'Elementary'],
        ['Office', 'physicalDeliveryOfficeName', 'Lincoln Elementary'], ['Employee ID', 'employeeID', mono('100482')],
      ]), { note: 'Edit and save, or leave as is.' })}
      <aside class="t-rail">
        ${card('Account', kv([['source', 'On-prem AD'], ['last logon', 'Today 7:12 AM'], ['bad password count', locked ? '5' : '0'], ['building', 'Lincoln Elementary']]), { note: 'Read from AD when the page opened.' })}
        ${card('Devices', kv([[mono('LES-LT-2214'), 'Intune'], [mono('LES-IPAD-T031'), 'Mosyle']]), { count: 2 })}
      </aside>
    </div>`;

  const resetDialog = () => dialog('Reset password', `
      <p>Reset the password for <b>Jordan Ellis</b> (${mono('jellis')}).</p>
      <div class="t-secret">
        <div class="t-secret-top"><span class="t-label">New password</span><span class="t-seg"><span class="is-on">Generate</span><span>Type</span></span></div>
        <p class="t-mono t-secret-value">Maple-Otter-42</p>
      </div>
      ${toggle('Must change at next logon', mono('pwdLastSet = 0'), true)}
      ${toggle('Also unlock the account', 'Currently locked out', true)}
      ${toggle('Email the password to me', '', false)}`,
    btn('Cancel', { kind: 'ghost' }) + btn('Reset password', { kind: 'primary', t: 'confirm-reset' }));

  // ---- HR import ---------------------------------------------------------------
  const stepper = () => `
    <ol class="t-stepper">
      <li class="is-done"><span class="t-stepnum">${ic('check')}</span><div><strong>Upload CSV</strong><small>HR_Export_10-21.csv · 412 rows</small></div></li>
      <li class="is-done"><span class="t-stepnum">${ic('check')}</span><div><strong>Map columns</strong><small>17 of 17 mapped</small></div></li>
      <li class="is-on"><span class="t-stepnum">3</span><div><strong>Review &amp; apply</strong><small>16 planned changes</small></div></li>
    </ol>`;

  const hr = (content) => `
    ${head('upload', 'HR Import', 'Import a CSV from any HR system, review the planned creates, updates and disables, then apply. Nothing is written until you apply.', ['Import', 'Rules', 'Profiles'])}
    <div class="t-body">${stepper()}${content}</div>`;

  const plan = (title, n, tone, rows) => `
    <section class="t-card t-plan">
      <header class="t-card-head"><h5>${title}</h5><span class="t-count t-${tone}">${n}</span></header>
      ${rows.map(([who, what, extra]) => `<div class="t-planrow"><strong>${who}</strong><span>${what}</span>${extra ? mono(extra) : ''}</div>`).join('')}
    </section>`;

  const hrReview = () => hr(`
    <div class="t-card-head t-plain"><h5>Planned changes</h5><span class="t-note">412 people · <b>16</b> to write · nothing is written until you apply</span></div>
    <div class="t-plans">
      ${plan('Create', 3, 'ok', [['Avery Chen', 'Paraeducator, Hill Middle', 'achen'], ['Dana Brooks', 'Bus driver, Transportation', 'dbrooks'], ['Luis Romero', 'Science teacher, Central High', 'lromero']])}
      ${plan('Update', 9, 'neutral', [['Sam Ortiz', 'Lincoln Elementary → Oak Elementary, groups follow'], ['Kim Patel', 'Title: Assistant Principal → Principal'], ['+ 7 more', 'office, title and department changes']])}
      ${plan('Disable', 2, 'bad', [['Riley Park', 'Retired June 14'], ['Chris Hale', 'Resigned, last day Friday']])}
      ${plan('Rename and leave', 2, 'cloud', [['Taylor Nguyen', 'Renamed to Taylor Reed', 'tnguyen → treed'], ['Pat Kim', 'Move to Leave OU · groups kept']])}
    </div>
    ${foot('<b>16</b> changes selected', btn('Export plan (CSV)', { kind: 'ghost' }) + btn('Review &amp; apply', { kind: 'primary', t: 'review' }))}`);

  const applyDialog = () => dialog('Apply changes to Active Directory', `
      ${kv([['Create accounts', '3'], ['Rename accounts', '1'], ['Update accounts', '9'], ['Disable accounts', '2'], ['Move to leave', '1']])}
      ${toggle('Dry run', 'Check every change against AD and write nothing', true)}`,
    btn('Cancel', { kind: 'ghost' }) + btn('Start dry run', { kind: 'primary', t: 'dry' }));

  // ---- Devices -------------------------------------------------------------------
  const devices = (selected, lost) => `
    ${head('laptop', 'Devices', 'Intune, Mosyle, Chromebooks and AD computers in one list. Open a device to act on it.', ['All devices 1,284', 'Intune 512', 'Mosyle (Apple) 772'])}
    <div class="t-body">
      ${stats([['1,284', 'Devices'], ['1,201', 'Checked in, last 7 days', 'ok'], ['38', 'Not seen in 14+ days', 'warn'], [lost ? '3' : '2', 'In Lost Mode']])}
      ${searchbox('Search by name, serial, user, model, group, asset tag, MAC or IP')}
      <div class="t-cols t-cols-wide">
        ${table({
          cols: '1.4fr .9fr 1.1fr .9fr', sm: '1.4fr 1fr', hide: [1, 3],
          headings: ['Device', 'Platform', 'User', 'Last seen'],
          rows: [
            { cells: [mono('LES-IPAD-0412'), 'iPadOS', 'Mia Torres', '2 min ago'] },
            { t: 'open-ipad', selected, cells: [mono('LES-IPAD-0377'), 'iPadOS', 'Noah Bennett', lost ? 'Just now' : '19 hours ago'] },
            { cells: [mono('HMS-LT-2291'), 'Windows', 'Avery Chen', '1 hour ago'] },
            { cells: [mono('OES-LT-1180'), 'Windows', 'Sam Ortiz', '3 days ago'] },
            { cells: [mono('CHS-CB-0098'), 'ChromeOS', 'Ana Ruiz', '4 hours ago'] },
          ],
        })}
        ${selected ? ipadPanel(lost) : `<div class="t-card t-empty-panel">${ic('ipad')}<p>No device selected</p></div>`}
      </div>
    </div>`;

  const actGroup = (label, buttons) => `<div class="t-actgroup"><p class="t-label">${label}</p><div class="t-btns">${buttons.join('')}</div></div>`;

  const ipadPanel = (lost) => `
    <section class="t-card t-device">
      <header class="t-device-head"><span class="t-device-icon">${ic('ipad')}</span>
        <div><h5 class="t-mono">LES-IPAD-0377</h5><p>iPad (10th generation) · Mosyle</p></div></header>
      <div class="t-chips">${chip('Supervised', 'ok')}${lost ? chip('Lost Mode', 'warn') : ''}${chip('Insurance paid')}</div>
      ${lost ? `<p class="t-located">${ic('location')}<span><b>Located just now</b> on the Bus 12 route, 0.4 mi from Lincoln Elementary</span></p>` : ''}
      ${kv([['User', 'Noah Bennett'], ['Serial', mono('DMPXK2Q4LM')], ['Last check-in', lost ? 'Just now' : 'Yesterday 3:41 PM'], ['DHCP IP', mono('10.20.14.87')]])}
      ${actGroup('Commands', [btn('Restart', { sm: true }), btn('Lock', { sm: true }), btn('Rename', { sm: true })])}
      ${actGroup('Find it', [btn('Locate', { sm: true }), btn('Play sound', { sm: true, icon: 'sound', t: 'sound' }),
        lost ? btn('Clear Lost Mode', { sm: true }) : btn('Lost Mode…', { sm: true, t: 'lost' })])}
      ${actGroup('Take it back', [btn('Unassign', { sm: true }), btn('Erase…', { sm: true, kind: 'danger' })])}
    </section>`;

  const lostDialog = () => dialog('Enable Lost Mode', `
      <p>Locks ${mono('LES-IPAD-0377')} and shows your message until you clear Lost Mode.</p>
      <div class="t-field"><div class="t-field-label"><span>Message shown on the device</span></div>
        <div class="t-input t-input-area">This iPad belongs to Lincoln Elementary. Please return it to the front office.</div></div>
      <div class="t-field"><div class="t-field-label"><span>Contact phone (optional)</span></div><div class="t-input">(555) 010-2200</div></div>`,
    btn('Cancel', { kind: 'ghost' }) + btn('Enable Lost Mode', { kind: 'primary', t: 'confirm-lost' }));

  // ---- Microsoft 365 (Entra ID) --------------------------------------------------
  const tile = (label, icon, value, sub, extra = '', cls = '') => `
    <div class="t-tile${cls ? ` ${cls}` : ''}"><p class="t-tile-label">${ic(icon)}${label}</p><b>${value}</b><p class="t-tile-sub">${sub}</p>${extra}</div>`;

  const entra = (lockedDown) => `
    ${head('cloud', 'Entra ID', 'The Microsoft 365 jobs a district does every week, on one board. ' + mono('22,426 synced · Entra Connect next 2:40 PM'))}
    <div class="t-body">
      <div class="t-board">
        ${tile('Risky users', 'shield', lockedDown ? '2' : '3', lockedDown ? '0 high · 2 medium' : '1 high · 2 medium',
          lockedDown
            ? `<div class="t-tile-row">${mono('mlopez')}${chip('Locked down', 'ok')}</div>`
            : `<div class="t-tile-row">${mono('mlopez')}${chip('High', 'bad')}<span class="t-tile-actions">${btn('Lock down', { sm: true, kind: 'danger', t: 'lockdown' })}${btn('Dismiss', { sm: true })}</span></div>`,
          lockedDown ? '' : 't-tile-risk')}
        ${tile('App registrations', 'key', '41', '2 secrets inside 60 days')}
        ${tile('Admin consent', 'user', '1', '1 waiting · 0 reviewed')}
        ${tile('Cloud groups', 'cloud', '286', '18 dynamic · 6 licensing')}
        ${tile('Conditional Access', 'shield', '12', '9 on · 1 report-only · 2 off')}
        ${tile('Devices', 'laptop', '1,284', '91% compliant', '<div class="t-meter"><i style="--fill:.91"></i></div>')}
      </div>
      ${card('Licenses', kv([['Microsoft 365 A3 for faculty', mono('42 free of 900')], ['Microsoft 365 A1 for students', mono('1,104 free of 9,000')], ['Power BI Pro for faculty', mono('3 free of 25')]]), { cls: 't-card-flush' })}
    </div>`;

  const lockdownDialog = () => dialog('Lock down account', `
      <p><b>Morgan Lopez</b> (${mono('mlopez@district.org')}) signed in from an unfamiliar country at 6:58 AM. Entra ID rates it <b>high risk</b>.</p>
      ${toggle('Revoke sessions', 'Signs out of every app and device now', true, 'checkbox')}
      ${toggle('Reset MFA', 'Must register their methods again', true, 'checkbox')}
      ${toggle('Require a new password at next sign-in', '', true, 'checkbox')}
      ${toggle('Confirm compromised in Entra ID', 'Feeds your risk-based Conditional Access', true, 'checkbox')}`,
    btn('Cancel', { kind: 'ghost' }) + btn('Lock down account', { kind: 'danger-fill', t: 'confirm-lockdown' }));

  // ---- Files ------------------------------------------------------------------------
  const files = (how, footer) => `
    ${head('folder', 'Files', 'Find files in OneDrive, SharePoint, Teams, network shares and Google Shared Drives, and hand a departing person\'s files over.', ['Browse &amp; search', 'Offboarding', 'Sharing audit'], 1)}
    <div class="t-body">
      ${card('Hand over a departing person\'s files', `
        <div class="t-fsection"><p class="t-fstep"><span>1</span>Who</p>
          <div class="t-handover">
            <div class="t-picked"><span>Departing person</span><strong>Riley Park (${mono('rpark')})</strong></div>
            <span class="t-arrow">${ic('arrow')}</span>
            <div class="t-picked is-on"><span>Give the files to</span><strong>Kim Patel (${mono('kpatel')})</strong></div>
          </div></div>
        <div class="t-fsection"><p class="t-fstep"><span>2</span>What to hand over</p>
          <div class="t-options">
            ${toggle('OneDrive', '1,284 files · 6.2 GB', true, 'checkbox')}
            ${toggle('Home folder', mono('\\\\fs01\\home\\rpark') + ' · 1.1 GB', true, 'checkbox')}
          </div></div>
        <div class="t-fsection"><p class="t-fstep"><span>3</span>How <small>there is no default; pick one</small></p>
          <div class="t-options">
            <button type="button" class="t-option" aria-pressed="${how === 'share'}" data-t="share">${ic('share')}<span><strong>Share ${pill('Instant')}</strong><small>Kim gets edit access where the files are. The access ends when Riley's account is deleted.</small></span></button>
            <button type="button" class="t-option" aria-pressed="${how === 'copy'}" data-t="copy">${ic('copy')}<span><strong>Copy ${pill('Survives deletion')}</strong><small>Everything is copied into a "From Riley Park" folder in Kim's own OneDrive.</small></span></button>
          </div>
          ${toggle('Email Kim the links when it\'s done', '', true, 'checkbox')}</div>`, { note: 'Pick who is leaving, who gets the files, what, and how.' })}
    </div>
    ${footer}`;

  const filesFoot = (state) => foot(state, btn('Open Audit Log', { kind: 'ghost' }) + btn('Start hand-over', { kind: 'primary', t: 'start-handover', disabled: state.startsWith('Pick') }));

  // ---- AI assistant -------------------------------------------------------------
  const assistant = (chat) => `
    ${head('bot', 'AI Assistant', 'Ask troubleshooting questions in plain language. It looks up live data you already have access to and can propose fixes. Nothing changes until you confirm.')}
    <div class="t-ai-status">${pill(`${ic('check')}Ready`, 'ok')}<span>Model ${mono('llama3.3:70b')}</span><span>Talks to Open WebUI at ${mono('ai.district.org')}</span><span>Not saved: the conversation ends when you close the tab</span></div>
    <div class="t-chat">${chat}</div>
    <div class="t-composer"><div class="t-composer-box"><span>e.g. Why can't jsmith sign in?</span>${btn('Send', { kind: 'primary', sm: true, icon: 'send' })}</div><p>Answers can be wrong. Check before acting.</p></div>`;

  const starters = () => `
    <div class="t-empty">
      <span class="t-empty-icon">${ic('bot')}</span>
      <h5>What can I help troubleshoot?</h5>
      <p>Start with a username, a device name or a symptom.</p>
      <div class="t-starters">
        <button type="button" class="t-starter">${ic('pulse')}<span><strong>Is anything down right now?</strong><small>Asks now</small></span></button>
        <button type="button" class="t-starter" data-t="ask">${ic('signin')}<span><strong>Why can't someone sign in?</strong><small>Asks about sortiz</small></span></button>
        <button type="button" class="t-starter">${ic('laptop')}<span><strong>What devices does someone have?</strong><small>Add a username</small></span></button>
        <button type="button" class="t-starter">${ic('printer')}<span><strong>How do I clear a stuck print queue?</strong><small>Asks now</small></span></button>
      </div>
    </div>`;

  const question = `<p class="t-msg-me">Why can't sortiz sign in?</p>`;
  const answer = (state) => `
    ${question}
    <div class="t-msg-ai">
      <p><b>Sam Ortiz</b>'s password expired yesterday. Five sign-in attempts with the old one locked the account at 7:31 AM. Everything else checks out: enabled, licensed, MFA registered, and the move to Oak Elementary synced last night.</p>
      <div class="t-action">
        <div class="t-action-head">${ic('wrench')}<strong>Reset the password for Sam Ortiz</strong>${state === 'done' ? chip('Done', 'ok') : chip('Needs your OK', 'warn')}</div>
        <div class="t-diff">
          <span class="t-diff-h"></span><span class="t-diff-h">Now</span><span class="t-diff-h">After</span>
          <span>Locked out</span><span>Yes</span><span>No</span>
          <span>Password</span><span>Expired</span><span>Temporary, change at sign-in</span>
        </div>
        ${state === 'done'
          ? `<p class="t-action-done">${ic('check')}Password reset and account unlocked. Temporary password ${mono('••••••••')} shown only here.</p>`
          : `<div class="t-action-foot">${btn('Cancel')}${btn('Reset password', { kind: 'primary', t: 'confirm-ai' })}</div>`}
      </div>
    </div>`;

  // ---- Network (printers) ---------------------------------------------------------
  const printers = (open, cleared) => `
    ${head('printer', 'Printers', 'Watch every print server\'s queues and clear stuck jobs, one job or the whole queue, without opening a remote session.')}
    <div class="t-body">
      ${stats([['48', 'Printers'], [cleared ? '48' : '47', 'Healthy', 'ok'], [cleared ? '7' : '23', 'Queued jobs'], [cleared ? '0' : '1', 'Stuck: error, blocked or offline', cleared ? '' : 'warn']])}
      <p class="t-section-title">Printers on ${mono('PRINT01')}</p>
      <div class="t-printers">
        <div class="t-printer${cleared ? '' : ' is-bad'}">
          <button type="button" class="t-printer-row" data-t="open-printer" aria-expanded="${open}">
            <span class="t-chev${open ? ' is-open' : ''}">${ic('chevron')}</span>${cleared ? pill('Ready', 'ok') : pill(`${ic('alert')}Error`, 'warn')}
            <span class="t-mono t-strong">LES-114-COPIER</span><span class="t-sm-hide t-muted">Lincoln, Room 114</span>${cleared ? pill('empty') : pill('16 queued', 'ok')}
          </button>
          ${open && !cleared ? `
            <div class="t-jobs">
              ${table({
                cols: '1.6fr 1fr 1fr .9fr', sm: '1.6fr 1fr', hide: [1, 3],
                headings: ['Document', 'Owner', 'Status', 'Submitted'],
                rows: [
                  { cells: ['Field trip form.pdf', mono('jellis'), pill('Error', 'warn'), '7:02 AM'] },
                  { cells: ['Spelling list week 9.docx', mono('mtorres'), 'Waiting', '7:05 AM'] },
                  { cells: ['Lunch count.xlsx', mono('office-les'), 'Waiting', '7:09 AM'] },
                  { cells: ['+ 13 more', '', '', ''] },
                ],
              })}
              <div class="t-btns">${btn('Test page', { sm: true })}${btn('Edit', { sm: true })}${btn('Clear all', { sm: true, kind: 'danger', t: 'clear' })}</div>
            </div>` : ''}
        </div>
        ${[['HMS-LIB-MFP', 'Hill Middle, Library', '4 queued'], ['OES-OFFICE', 'Oak Elementary, Office', 'empty'], ['CHS-201-LASER', 'Central High, Room 201', '3 queued']].map(([n, where, q]) => `
          <div class="t-printer"><button type="button" class="t-printer-row" aria-expanded="false"><span class="t-chev">${ic('chevron')}</span>${pill('Ready', 'ok')}<span class="t-mono t-strong">${n}</span><span class="t-sm-hide t-muted">${where}</span>${pill(q, q === 'empty' ? '' : 'ok')}</button></div>`).join('')}
      </div>
    </div>`;

  const clearDialog = () => dialog('Clear all jobs', `<p>Delete all 16 job(s) in the queue on ${mono('LES-114-COPIER')}? This cannot be undone.</p>`,
    btn('Cancel', { kind: 'ghost' }) + btn('Clear all', { kind: 'danger-fill', t: 'confirm-clear' }));

  // ---- Create User --------------------------------------------------------------------
  const createUser = (created) => `
    ${head('plus', 'Create User', 'Third-party staff. Username, email and password are generated for you. You only pick the department and type the name.')}
    <div class="t-bar"><div class="t-btns">${segbar(['Third-party staff', 'Advanced (IT)'], 'Third-party staff')}${segbar(['One person', 'Batch'], 'One person')}</div></div>
    ${created ? `
      <div class="t-body">
        ${result('1 account created in Transportation', 'Passwords are shown once. Print or email them before you leave this page.')}
        ${card('Jamie Rivera', kv([['Login name', mono('jrivera')], ['Email', mono('jrivera@district.org')], ['Temporary password', mono('Cedar-Lark-87')], ['Enabled on', 'Monday 10/26/2026']]), { note: 'Bus driver · Metro Student Transit' })}
        <div class="t-btns">${btn('Print handout', { icon: 'printer' })}${btn('Email the vendor', { icon: 'mail' })}</div>
      </div>` : `
      <div class="t-body t-cols">
        <div class="t-rail">
          ${card('Department', `<div class="t-choices">${['Food Service', 'Transportation', 'Custodial', 'Substitutes', 'Coaches'].map((d) => `<span${d === 'Transportation' ? ' class="is-on"' : ''}>${d}</span>`).join('')}</div>`, { count: 1 })}
          ${card('The person', fields([['First name', '', 'Jamie'], ['Last name', '', 'Rivera'], ['Title / position', '', 'Bus driver'], ['Vendor / staffing agency', '', 'Metro Student Transit'], ['Start date', '', '10/26/2026']]))}
        </div>
        ${card('What gets created', `
          ${kv([['Login name', mono('jrivera')], ['Email', mono('jrivera@district.org')], ['Password', mono('Cedar-Lark-87')], ['Groups', 'Transportation, Staff-All']])}
          <div class="t-fsection">
            ${toggle('Must change it at first sign-in', '', true, 'checkbox')}
            ${toggle('Account enabled on the start date', '', true, 'checkbox')}
          </div>`, { note: 'First initial + last name' })}
      </div>
      ${foot('Transportation · 1 person', btn('Cancel', { kind: 'ghost' }) + btn('Create account', { kind: 'primary', t: 'create' }))}`}`;

  // ---- Compare Users ------------------------------------------------------------------
  const compareRows = (copied) => [
    ['HMS-Staff', true], ['Wi-Fi-Staff', true], ['HMS-Paras', copied], ['SPED-Shared', copied],
    ['Copier-HMS', copied], ['Staff-All', true],
  ].map(([g, b]) => ({ cells: [mono(g), member, b ? member : btn('Add', { sm: true })] }));

  const compare = (copied) => `
    ${head('users', 'Compare Users', 'Put two accounts side by side (attributes, account state, groups and licenses) and copy across the group memberships one of them is missing.')}
    <div class="t-bar">
      <div class="t-handover">
        <div class="t-picked"><span>User A, name or username</span><strong>Dana Lee (${mono('dlee')})</strong></div>
        <span class="t-arrow" title="Swap A and B">${ic('swap')}</span>
        <div class="t-picked is-on"><span>User B, name or username</span><strong>Avery Chen (${mono('achen')})</strong></div>
      </div>
    </div>
    <div class="t-body">
      ${stats([['2', 'Attributes differ'], [copied ? '6' : '3', 'Groups shared', 'ok'], [copied ? '0' : '3', 'Only Dana Lee', copied ? '' : 'warn'], ['0', 'Only Avery Chen']])}
      ${card('On-prem AD groups', table({
        cols: '1.4fr 1fr 1fr', headings: ['Group', 'Dana Lee', 'Avery Chen'], rows: compareRows(copied),
      }), { note: copied ? '6 shared · 0 only A · 0 only B' : '3 shared · 3 only A · 0 only B', cls: 't-card-flush' })}
    </div>
    ${foot(copied ? 'Nothing to copy. Every editable group matches.' : '2 attributes differ · <b>3</b> missing on B',
      btn('Copy 0 to A', { disabled: true }) + btn(copied ? 'Copy 0 to B' : 'Copy 3 to B', { kind: 'primary', t: 'copy-b', disabled: copied }))}`;

  const compareDialog = () => dialog('Add Avery Chen to 3 groups?', `
      <p>${mono('HMS-Paras')}, ${mono('SPED-Shared')} and ${mono('Copier-HMS')}. Memberships are only added, nothing is removed. Each add is written to the Audit Log.</p>`,
    btn('Cancel', { kind: 'ghost' }) + btn('Add to 3', { kind: 'primary', t: 'confirm-copy' }));

  // ---- Group Actions --------------------------------------------------------------------
  const groupActions = (ran) => `
    ${head('users', 'Group Actions', 'Pick an AD group, choose which of its members to act on, then run a bulk action. Nothing happens until you press Run, and you get a result for every member.')}
    <div class="t-bar"><div class="t-btns">${searchbox(`Group: <b>${mono('Wi-Fi-Staff')}</b>`)}${btn('Create group', { icon: 'plus' })}${btn('Bulk paste members')}</div></div>
    <div class="t-body">
      ${stats([['312', 'Direct user members'], ['4', 'Selected for the next action'], ['2', 'Nested groups, not expanded'], [ran ? '0' : '4', 'Disabled accounts still in the group', ran ? 'ok' : 'warn']])}
      ${ran
        ? card('Results', table({
            cols: '1.3fr 1fr .9fr 1.4fr', sm: '1.3fr .9fr', hide: [1, 3], headings: ['Name', 'Username', 'Result', 'Detail'],
            rows: [['Riley Park', 'rpark'], ['Chris Hale', 'chale'], ['Jo Martin', 'jmartin'], ['Lee Grant', 'lgrant']]
              .map(([n, u]) => ({ cells: [n, mono(u), pill('Removed', 'ok'), 'Removed from Wi-Fi-Staff'] })),
          }), { count: '4 succeeded · 0 failed', tone: 'ok', cls: 't-card-flush' })
        : `${card('Members', table({
            cols: '28px 1.3fr 1fr 1.3fr .9fr', sm: '28px 1.3fr .9fr', hide: [2, 3], headings: ['', 'Name', 'Username', 'Title', 'Enabled'],
            rows: [['Riley Park', 'rpark', 'Teacher (retired)'], ['Chris Hale', 'chale', 'Counselor'], ['Jo Martin', 'jmartin', 'Custodian'], ['Lee Grant', 'lgrant', 'Substitute']]
              .map(([n, u, t]) => ({ selected: true, cells: [tick(true), n, mono(u), t, pill('Disabled', 'warn')] }))
              .concat([{ cells: [tick(false), 'Avery Chen', mono('achen'), 'Paraeducator', pill('Enabled', 'ok')] }]),
          }), { note: 'Showing 5 of 312 · disabled first', cls: 't-card-flush' })}
          <div class="t-card t-actioncard"><p><b>Action on 4 selected</b></p><div class="t-select">Remove from this group</div>${btn('Run', { kind: 'primary', t: 'run' })}</div>`}
    </div>`;

  const bulkDialog = () => dialog('Confirm bulk action', `<p>Remove from this group: apply to 4 member(s) of '${mono('Wi-Fi-Staff')}'? This cannot be undone in bulk.</p>`,
    btn('Cancel', { kind: 'ghost' }) + btn('Run', { kind: 'primary', t: 'confirm-run' }));

  // ---- Disabled Cleanup -------------------------------------------------------------------
  const STALE = [['Pat Owens', 'powens', '1,104 days · Oct 14, 2023'], ['Morgan Fry', 'mfry', '846 days · Jun 29, 2024'], ['Sky Daniels', 'sdaniels', '702 days · Nov 20, 2024'],
    ['Robin Cole', 'rcole', '611 days · Feb 19, 2025'], ['Casey Wu', 'cwu', '498 days · Jun 12, 2025'], ['Ari Banks', 'abanks', '412 days · Sep 5, 2025']];

  const cleanup = (state) => `
    ${head('trash', 'Disabled Cleanup', 'Find accounts that have been disabled for a long time and delete them from Active Directory. Disabled 365+ days · deletion is permanent · auto-delete: off.')}
    <div class="t-bar"><div class="t-btns"><span class="t-inline">Find disabled at least <span class="t-mini-input">365</span> days</span>
      ${toggle('include estimated', '', false, 'checkbox')}${btn('Scan', { kind: state === 'start' ? 'primary' : '', icon: 'search', t: 'scan' })}</div></div>
    <div class="t-body">
      ${state === 'start' || state === 'deleted'
        ? `<div class="t-card t-empty-panel">${ic(state === 'start' ? 'search' : 'check')}<p>${state === 'start' ? 'Scan to list accounts disabled for 365 days or more.' : 'Nothing to clean up.'}</p></div>`
        : `<section class="t-card t-card-flush">
            <header class="t-card-head"><h5>Eligible for deletion</h5><span class="t-count">6</span><span class="t-note">off by default: tick a row to include it</span>
              ${state === 'found' ? `<span class="t-head-action">${btn('Select all 6', { sm: true, t: 'select-all' })}</span>` : ''}</header>
            ${table({
              cols: '28px 1.2fr .9fr 1.6fr', sm: '28px 1fr 1.2fr', hide: [2], headings: ['', 'Person', 'Username', 'Disabled'],
              rows: STALE.map(([n, u, d]) => ({ selected: state !== 'found', cells: [tick(state !== 'found'), n, mono(u), d] })),
            })}
          </section>`}
    </div>
    ${state === 'start' || state === 'deleted' ? '' : foot(`<b>${state === 'found' ? 0 : 6}</b> selected for deletion · this cannot be undone`,
      btn(state === 'found' ? 'Delete 0 selected' : 'Delete 6 selected', { kind: 'danger-fill', t: 'delete', disabled: state === 'found' }))}`;

  const deleteDialog = () => dialog('Delete disabled accounts', '<p>Permanently delete 6 account(s) from Active Directory? This cannot be undone.</p>',
    btn('Cancel', { kind: 'ghost' }) + btn('Delete 6', { kind: 'danger-fill', t: 'confirm-delete' }));

  // ---- Google Workspace -------------------------------------------------------------------
  const google = (selected, signedOut) => `
    ${head('cloud', 'Google Workspace', 'Find a Google account and suspend, restore, reset or sign it out, without opening the Google Admin console.')}
    <div class="t-bar"><div class="t-btns">${searchbox('patel')}${btn('Search', { kind: 'primary', sm: true })}</div></div>
    <div class="t-body t-cols t-cols-wide">
      ${table({
        cols: '1.6fr 1fr .8fr', sm: '1.6fr .8fr', hide: [1], headings: ['User', 'Org unit', 'Status'],
        rows: [
          { t: 'open-google', selected, cells: [`<b>Kim Patel</b><br>${mono('kpatel@district.org')}`, '/Staff/Hill', pill('Active', 'ok')] },
          { cells: [`<b>Ravi Patel</b><br>${mono('rpatel@district.org')}`, '/Staff/Central', pill('Active', 'ok')] },
          { cells: [`<b>Nia Patel</b><br>${mono('npatel27@district.org')}`, '/Students/Hill', pill('Active', 'ok')] },
        ],
      })}
      ${selected ? `
        <section class="t-card">
          <header class="t-card-head"><h5>Kim Patel</h5>${chip(signedOut ? 'Signed out' : 'Signed in · 3 sessions', signedOut ? 'ok' : 'neutral')}</header>
          ${kv([['Primary email', mono('kpatel@district.org')], ['Org unit', '/Staff/Hill'], ['Last login', signedOut ? 'Just now (sessions revoked)' : 'Last night 8:52 PM'], ['2-Step Verification', 'On'], ['Admin', 'No']])}
          <div class="t-actgroup"><div class="t-btns">${btn('Suspend', { sm: true, kind: 'danger' })}${btn('Reset password', { sm: true })}${btn('Sign out everywhere', { sm: true, t: 'signout' })}</div></div>
        </section>` : `<div class="t-card t-empty-panel">${ic('user')}<p>Select a user to view details and actions.</p></div>`}
    </div>`;

  const signoutDialog = () => dialog('Sign out everywhere', `<p>Revoke all of ${mono('kpatel@district.org')}'s active sessions (web and devices)?</p>`,
    btn('Cancel', { kind: 'ghost' }) + btn('Sign out', { kind: 'primary', t: 'confirm-signout' }));

  // ---- Exchange (mailbox panel on the user page) ------------------------------------------
  const mailbox = (offboarded) => `
    <div class="t-user">
      <span class="t-back">${ic('back')}Overview</span>
      <div class="t-user-id"><span class="t-avatar">RP</span>
        <div><div class="t-user-name"><h4>Riley Park</h4>${pill('Disabled', 'warn')}${pill('Staff')}</div><p class="t-sub">${mono('rpark')}${mono('rpark@district.org')}</p></div></div>
    </div>
    <div class="t-body">
      ${card('Mailbox', `
        ${kv([
          ['Type', offboarded ? 'Shared mailbox' : 'User mailbox'], ['Size', '6.8 GB of 100 GB'], ['Address book', offboarded ? 'Hidden' : 'Shown'],
          ['Forwarding', offboarded ? 'None' : mono('rpark.home@example.com')], ['Automatic replies', offboarded ? pill('On', 'ok') : 'Off'],
          ['Delegates', offboarded ? 'Kim Patel (Full Access)' : 'None'], ['Inbox rules', '2'], ['Mobile devices', '1 iPhone'],
        ])}
        <div class="t-actgroup t-departed"><p><b>Departed?</b> ${offboarded ? 'This mailbox has been offboarded.' : 'Hand the mailbox over in one step.'}</p>
          ${offboarded ? pill(`${ic('check')}Offboarded`, 'ok') : btn('Offboard mailbox…', { sm: true, kind: 'primary', t: 'offboard' })}</div>`,
        { note: 'Exchange Online' })}
    </div>`;

  const offboardDialog = () => dialog("Offboard Riley Park's mailbox?", `
      ${toggle('Clear forwarding', 'Stops sending mail to a personal address', true, 'checkbox')}
      ${toggle('Convert to a shared mailbox', 'Keeps the mail without a license', true, 'checkbox')}
      ${toggle('Give someone Full Access', 'Kim Patel, added to Outlook automatically', true, 'checkbox')}
      ${toggle('Departure auto-reply', '"Riley has retired. Please contact Kim Patel."', true, 'checkbox')}
      ${toggle('Hide from the address book', '', true, 'checkbox')}`,
    btn('Cancel', { kind: 'ghost' }) + btn('Offboard', { kind: 'primary', t: 'confirm-offboard' }));

  // ---- DNS ------------------------------------------------------------------------------------
  const dnsRecords = (added) => `
    ${head('globe', 'DNS', 'The zones and records on your DNS servers, plus a lookup that asks every server the same question so you can see when a change has replicated.')}
    <div class="t-bar"><div class="t-btns">${segbar(['Zones', 'Records', 'Lookup', 'Server'], 'Records', added ? { Lookup: 'lookup' } : {})}
      ${searchbox('Zone: ' + mono('district.org'))}${btn('Add record', { kind: added ? '' : 'primary', icon: 'plus', t: 'add-record' })}</div></div>
    <div class="t-body">
      ${stats([['14', 'Forward lookup zones'], ['9', 'Reverse lookup zones'], ['3', 'Conditional forwarders'], ['0', 'Paused or shut down', 'ok']])}
      ${table({
        cols: '1.3fr .6fr 1.3fr 1.2fr', sm: '1.3fr .6fr 1.3fr', hide: [3], headings: ['Name', 'Type', 'Data', 'Timestamp'],
        rows: [
          ...(added ? [{ selected: true, cells: [mono('badge-printer'), 'A', mono('10.20.30.45'), 'Static'] }] : []),
          { cells: [mono('@'), 'MX', mono('10 mail.district.org'), 'Static'] },
          { cells: [mono('print01'), 'A', mono('10.20.1.15'), 'Static'] },
          { cells: [mono('les-lt-2214'), 'A', mono('10.20.14.61'), 'Today 7:02 AM'] },
          { cells: [mono('portal'), 'CNAME', mono('district.powerschool.com'), 'Static'] },
        ],
      })}
    </div>`;

  const dnsDialog = () => dialog('Add a record to district.org', `
      <div class="t-field"><div class="t-field-label"><span>Type</span></div><div class="t-input t-select">A: host → IPv4</div></div>
      <div class="t-field"><div class="t-field-label"><span>Name</span></div><div class="t-input">${mono('badge-printer')}</div></div>
      <div class="t-field"><div class="t-field-label"><span>IPv4 address</span></div><div class="t-input">${mono('10.20.30.45')}</div></div>
      ${toggle('Also create the PTR record', 'The reverse zone must already exist', true, 'checkbox')}
      <p class="t-note">A record added here is static: scavenging never removes it.</p>`,
    btn('Cancel', { kind: 'ghost' }) + btn('Add record', { kind: 'primary', t: 'confirm-record' }));

  const dnsLookup = (asked) => `
    ${head('globe', 'DNS', 'The zones and records on your DNS servers, plus a lookup that asks every server the same question so you can see when a change has replicated.')}
    <div class="t-bar"><div class="t-btns">${segbar(['Zones', 'Records', 'Lookup', 'Server'], 'Lookup')}
      ${searchbox(mono('badge-printer.district.org'))}${btn('Ask every server', { kind: 'primary', t: 'ask-dns' })}</div></div>
    <div class="t-body">
      ${asked ? `
        ${result('Every server agrees', `${mono('badge-printer.district.org')} resolves to ${mono('10.20.30.45')} on all 3 servers.`)}
        ${table({
          cols: '1fr 1.2fr .6fr', headings: ['Server', 'Answer', 'Took'],
          rows: [['DC01', '4 ms'], ['DC02', '6 ms'], ['DC03', '11 ms']].map(([s, t]) => ({ cells: [mono(s), mono('10.20.30.45'), t] })),
        })}`
        : `<div class="t-card t-empty-panel">${ic('globe')}<p>Ask every server the same question.</p></div>`}
    </div>`;

  // ---- DHCP -----------------------------------------------------------------------------------
  const dhcp = (reserved) => `
    ${head('network', 'DHCP', 'Browse scopes, edit options, reservations and exclusions, and search leases by name, IP or MAC. Changes go to the failover primary and replicate on save.')}
    <div class="t-bar"><div class="t-btns">${segbar(['IPv4', 'IPv6'], 'IPv4')}${searchbox(mono('00-1B-A9-4C-22-10'))}${toggle('All servers', '', true, 'checkbox')}</div></div>
    <div class="t-body">
      ${stats([['86', 'Scopes'], ['84', 'Active', 'ok'], ['84', 'In failover'], ['2', 'Above 90% utilization', 'warn']])}
      ${reserved
        ? card('Reservations', table({
            cols: '1fr 1fr 1.3fr 1.2fr', sm: '1fr 1.3fr', hide: [0, 2], headings: ['Scope', 'Reserved IP', 'MAC address', 'Name'],
            rows: [{ selected: true, cells: [mono('10.20.14.0'), mono('10.20.14.40'), mono('00-1B-A9-4C-22-10'), mono('LES-114-COPIER')] }],
          }), { count: 1, cls: 't-card-flush' })
        : card('Leases', table({
            cols: '1fr 1fr 1.3fr 1.2fr .8fr auto', sm: '1fr 1.2fr auto', hide: [0, 2, 4], headings: ['Scope', 'IP', 'MAC / DUID', 'Host', 'State', ''],
            rows: [{ cells: [mono('10.20.14.0'), mono('10.20.14.40'), mono('00-1B-A9-4C-22-10'), mono('LES-114-COPIER'), pill('Active', 'ok'),
              btn('Convert to reservation', { sm: true, icon: 'pin', t: 'reserve' })] }],
          }), { count: 1, note: 'Matched by MAC', cls: 't-card-flush' })}
    </div>`;

  const reserveDialog = () => dialog('Add reservation', `
      <div class="t-field"><div class="t-field-label"><span>Reserved IP</span></div><div class="t-input">${mono('10.20.14.40')}</div></div>
      <div class="t-field"><div class="t-field-label"><span>MAC address</span></div><div class="t-input">${mono('00-1B-A9-4C-22-10')}</div></div>
      <div class="t-field"><div class="t-field-label"><span>Name</span></div><div class="t-input">${mono('LES-114-COPIER')}</div></div>
      <div class="t-field"><div class="t-field-label"><span>Description</span></div><div class="t-input">Lincoln, Room 114 copier</div></div>`,
    btn('Cancel', { kind: 'ghost' }) + btn('Add', { kind: 'primary', t: 'confirm-reserve' }));

  // ---- Network Monitor -------------------------------------------------------------------------
  const monitor = (state) => `
    ${head('pulse', 'Network Monitor', 'Any vendor\'s switches, wireless, firewalls, UPSes and printers, polled over ping and SNMP, plus Find port: which switch port a MAC, IP or host name is plugged into.')}
    <div class="t-bar"><div class="t-btns">${segbar(['Devices', 'Ports', 'Access points', 'Find port', 'Log'], 'Find port')}</div></div>
    <div class="t-body">
      ${stats([['214', 'Devices'], [state === 'fixed' ? '0' : '1', 'Down', state === 'fixed' ? 'ok' : 'warn'], ['3', 'Warnings'], [state === 'fixed' ? '86 of 86' : '85 of 86', 'Access points joined']])}
      <div class="t-btns">${searchbox(mono('LES-AP-114'))}${btn('Find port', { kind: state === 'start' ? 'primary' : '', icon: 'search', t: 'find-port' })}</div>
      ${state === 'start' ? '' : `
        <section class="t-card">
          <header class="t-card-head"><h5>${pill(`${ic('check')}LES-IDF1-SW2 Gi1/0/14`, 'ok')}</h5><span class="t-note">${mono('LES-AP-114')} was last seen on this port</span></header>
          ${kv([['Port status', 'Up · 1 Gbps'], ['VLAN', '20 (Staff)'], ['PoE draw', state === 'fixed' ? '13.1 W' : pill('0.0 W, no power draw', 'warn')], ['Access point', state === 'fixed' ? pill('Joined', 'ok') : pill('Down since 6:12 AM', 'warn')]])}
          <div class="t-actgroup"><div class="t-btns">${btn('Bounce', { sm: true })}${btn('Power-cycle PoE', { sm: true, t: 'poe' })}${btn('Cable test', { sm: true })}</div></div>
        </section>`}
    </div>`;

  const poeDialog = () => dialog('Power-cycle PoE on Gi1/0/14?', `<p>Turns power off and back on for whatever is plugged into ${mono('LES-IDF1-SW2 Gi1/0/14')}. The access point restarts and rejoins in about two minutes.</p>`,
    btn('Cancel', { kind: 'ghost' }) + btn('Power-cycle', { kind: 'primary', t: 'confirm-poe' }));

  // ---- Quick Links ---------------------------------------------------------------------------------
  const linkRow = ([title, desc, host, t], pinned) => `
    <div class="t-linkrow"><span class="t-favicon">${title[0]}</span>
      <div><strong>${title}</strong><p>${desc} · ${mono(host)}</p></div>
      <button type="button" class="t-iconbtn${pinned ? ' is-on' : ''}" aria-label="${pinned ? 'Pinned' : 'Pin for me'}"${t ? ` data-t="${t}"` : ''}>${ic('pin')}</button>
      <span class="t-iconbtn" aria-hidden="true">${ic('external')}</span></div>`;

  const quickLinks = (pinned) => `
    ${head('link', 'Quick Links', 'The consoles, dashboards and vendor portals this team works in every day, with the note you need before you open one.')}
    <div class="t-bar"><div class="t-btns">${searchbox('Filter links: name, URL, tag or description')}${btn('Edit links')}</div>
      <div class="t-filters">${['All', 'Microsoft', 'Apple', 'Google', 'Network', 'Vendors'].map((f, i) => (i ? `<span class="t-filter">${f}</span>` : pill(f, 'ok'))).join('')}</div></div>
    <div class="t-body">
      ${card('Pinned', [['Entra admin center', 'Sign-in logs, CA', 'entra.microsoft.com'], ['Google Admin', 'Chromebook policies', 'admin.google.com'],
        ...(pinned ? [['Mosyle Manager', 'iPad profiles and apps', 'manager.mosyle.com']] : [])].map((l) => linkRow(l, true)).join(''), { count: pinned ? 3 : 2, cls: 't-card-flush' })}
      ${card('Apple', [['Mosyle Manager', 'iPad profiles and apps', 'manager.mosyle.com', pinned ? '' : 'pin'], ['Apple School Manager', 'Device enrollment, Managed Apple IDs', 'school.apple.com']]
        .map((l, i) => linkRow(l, pinned && i === 0)).join(''), { count: 2, cls: 't-card-flush' })}
      ${card('Vendors', [['PowerSchool', 'Student information system', 'district.powerschool.com'], ['Copier service portal', 'Log a service call; have the asset tag ready', 'service.example.com']]
        .map((l) => linkRow(l, false)).join(''), { count: 2, cls: 't-card-flush' })}
    </div>`;

  // ---- System Health ----------------------------------------------------------------------------------
  const CHECKS = [
    ['Active Directory', 'clock sync', 'DC01 reachable, clock within 0.2 s', 'ok', '18 ms'],
    ['Microsoft Graph', 'app secret', 'Connected · app secret expires in 21 days', 'warn', '142 ms'],
    ['Google Workspace', '', 'Service account authorized', 'ok', '231 ms'],
    ['SMTP relay', '', 'Relay accepted a test message', 'ok', '64 ms'],
    ['Audit log', '', 'Writable · 1,204 entries this week', 'ok', '9 ms'],
  ];
  const health = (state) => `
    ${head('heart', 'System Health', 'Every dependency this tool has, checked live: the directory, Graph, Google, the mail relay and the audit path.')}
    <div class="t-body">
      ${state === 'running'
        ? run('Re-running all checks', 'Checking Active Directory, Microsoft Graph, Google Workspace, the SMTP relay and the audit log…', 1400)
        : `<div class="t-result t-result-warn">${ic('alert')}<div><h5>Some checks need attention.</h5><p>Checked ${state === 'done' ? 'just now' : 'today at 6:00 AM'}.</p></div>${btn('Re-run all checks', { icon: 'sync', t: 'rerun' })}</div>`}
      <section class="t-card t-card-flush">
        ${CHECKS.map(([name, sub, detail, tone, ms]) => `
          <div class="t-check"><span class="t-check-dot t-${state === 'running' ? 'neutral' : tone}"></span>
            <div><strong>${name}</strong>${sub ? ` <span class="t-muted">/ ${sub}</span>` : ''}<p>${state === 'running' ? 'Checking…' : detail}</p></div>
            <span class="t-mono t-muted">${state === 'running' ? '' : ms}</span></div>`).join('')}
      </section>
      <p class="t-note">Checks also run automatically once a day; warnings and errors are emailed to the configured recipients.</p>
    </div>`;

  // ---- Settings: Access & Roles -----------------------------------------------------------------------
  const PERMS = [['Search', true], ['User detail', true], ['Reset password', true], ['Unlock', true], ['Create User', false], ['HR Import', false],
    ['Devices', false], ['Files', false], ['Entra ID', false], ['Printers', false]];

  const grantRow = (name, perms, scope, open) => `
    <div class="t-grant${open ? ' is-open' : ''}">
      <div class="t-grant-row">${chip('Group', 'cloud')}<strong class="t-mono">${name}</strong><span class="t-muted">${perms} permissions</span>${pill(scope, scope.startsWith('reset: any') ? '' : 'ok')}</div>
      ${open ? `
        <div class="t-perms">${PERMS.map(([p, on]) => toggle(p, '', on, 'checkbox')).join('')}</div>
        <div class="t-scope"><p class="t-label">Password reset scope</p>
          <p>Only members of ${chip('LES-Staff', 'ok')} can have their password reset by this grant.</p></div>` : ''}
    </div>`;

  const settings = (state) => `
    ${head('sliders', 'Settings', 'Grant tool access to AD groups, and tick exactly which pages and features each may use. A grant with no ticks locks its members out of everything.', ['General', 'Active Directory', 'Access &amp; Roles', 'Files', 'Printers'], 2)}
    <div class="t-body">
      <div class="t-btns">${searchbox(mono('DISTRICT\\LES-Office'))}${segbar(['Group', 'User'], 'Group')}${btn('Add grant', { kind: state === 'start' ? 'primary' : '', icon: 'plus', t: 'add-grant' })}</div>
      <section class="t-card t-card-flush">
        <header class="t-card-head"><h5>Grants</h5><span class="t-note">${state === 'start' ? 2 : 3} grants · super-admin excluded</span></header>
        ${grantRow('IT-Techs', 48, 'reset: any user', false)}
        ${grantRow('Help-Desk', 22, 'reset: any user', false)}
        ${state === 'start' ? '' : grantRow('LES-Office', 4, '1 group scope', state === 'added')}
      </section>
      <p class="t-note">Ticks take effect the next time a member loads a page. Every change here is written to the Audit Log.</p>
    </div>
    ${state === 'start' ? '' : foot(state === 'saved' ? 'All changes saved.' : '1 unsaved grant',
      btn('Discard changes', { kind: 'ghost' }) + btn('Save access &amp; modules', { kind: 'primary', t: 'save', disabled: state === 'saved' }))}`;

  // ---- Audit log ----------------------------------------------------------------------
  const audit = (log) => `
    ${head('log', 'Audit Log', 'Every change and every sensitive lookup, with who did it and when. Kept for as long as you choose.', ['Today', '7 days', '30 days', '90 days'])}
    <div class="t-body">
      ${stats([[String(log.length), 'Entries'], [String(log.length), 'Today'], [String(log.length), 'Made by you', 'ok'], ['0', 'Failed']])}
      ${log.length
        ? card('Today', log.slice().reverse().map((e) => `
            <div class="t-audit-row">
              <span class="t-mono t-muted">${e.time}</span>
              <div><strong>${e.action}</strong>${e.assistant ? chip('Assistant', 'cloud') : ''}<p>${mono(e.target)} · ${e.detail}</p></div>
              <span class="t-mono t-muted t-sm-hide">you</span>
            </div>`).join(''), { count: log.length, note: '0 failed', cls: 't-card-flush' })
        : `<div class="t-card t-empty-panel">${ic('log')}<p>Nothing yet. Try a tool and your actions show up here.</p></div>`}
    </div>`;

  // ---- The tour --------------------------------------------------------------------
  const STOPS = [
    {
      group: 'Directory', name: 'Accounts', task: 'Unlock a teacher',
      steps: [
        { view: overview, target: 'search',
          say: 'A teacher at Lincoln Elementary is locked out, and class starts in 15 minutes. Click the <b>search bar</b> to look up jellis.' },
        { view: results, query: 'jellis', target: 'open-user',
          say: 'One search covers on-prem AD, Entra ID and Google Workspace. Open <b>Jordan Ellis</b>.' },
        { view: () => jordan(true), target: 'reset',
          say: 'Jordan is locked out. <b>Reset password</b> can unlock the account in the same step.' },
        { view: () => jordan(true), dialog: resetDialog, target: 'confirm-reset',
          say: '"Also unlock the account" is already on. Click <b>Reset password</b>.',
          log: { action: 'Reset password', target: 'jellis', detail: 'must change at next logon · also unlocked' } },
        { view: () => jordan(false), toast: 'Password reset and account unlocked',
          say: 'Done. Jordan can sign in with a temporary password and has to pick a new one. Four clicks, before the bell.' },
      ],
    },
    {
      group: 'Directory', name: 'Create User', task: 'Add a bus driver',
      steps: [
        { view: () => createUser(false), target: 'create',
          say: 'A staffing agency is sending a new bus driver. Pick the department, type the name, and MADx builds the login, email and password. Click <b>Create account</b>.',
          log: { action: 'Create user', target: 'jrivera', detail: 'Transportation · third-party staff · enabled on start date' } },
        { view: () => createUser(true), toast: 'Account created for jrivera',
          say: 'Done. The account turns on the morning Jamie starts, and the handout has everything Jamie needs on day one. Office staff can do this without IT.' },
      ],
    },
    {
      group: 'Directory', name: 'Compare Users', task: 'Match a colleague\'s groups',
      steps: [
        { view: () => compare(false), target: 'copy-b',
          say: 'Avery is a new para doing the same job as Dana, but is missing three groups. Click <b>Copy 3 to B</b>.' },
        { view: () => compare(false), dialog: compareDialog, target: 'confirm-copy',
          say: 'Memberships are only added, never removed. Click <b>Add to 3</b>.',
          log: { action: 'Add to groups', target: 'achen', detail: 'HMS-Paras, SPED-Shared, Copier-HMS · copied from dlee' } },
        { view: () => compare(true), toast: 'Added achen to 3 groups',
          say: 'Done. Avery now has the same shares, printers and Wi-Fi as Dana, without anyone guessing which groups matter.' },
      ],
    },
    {
      group: 'Directory', name: 'HR automation', task: 'Run tonight\'s HR import',
      steps: [
        { view: hrReview, target: 'review',
          say: 'Last night\'s HR export is mapped, and MADx found <b>16 changes</b> for 412 people. Look them over, then click <b>Review &amp; apply</b>.' },
        { view: hrReview, dialog: applyDialog, target: 'dry',
          say: 'Start with a <b>dry run</b>. It checks every change against Active Directory and writes nothing.',
          log: { action: 'HR import, dry run', target: 'HR_Export_10-21.csv', detail: '16 changes checked · nothing written' } },
        { view: () => hr(run('Dry run in progress', 'Checking 16 changes against Active Directory…', 1800)), auto: 1800,
          say: 'Checking 16 changes against Active Directory…' },
        { view: () => hr(`${result('Dry run complete. Nothing was written.', '16 of 16 changes would succeed. The new usernames achen, dbrooks and lromero are free.')}
            <div class="t-btns">${btn('Apply 16 changes', { kind: 'primary', t: 'apply' })}${btn('Back to mapping')}</div>`), target: 'apply',
          say: 'Every change would succeed. Click <b>Apply 16 changes</b> to run it for real.',
          log: { action: 'HR import applied', target: 'HR_Export_10-21.csv', detail: '3 created · 9 updated · 1 renamed · 2 disabled · 1 to leave' } },
        { view: () => hr(run('Applying changes', 'Writing 16 changes to Active Directory…', 1800)), auto: 1800,
          say: 'Writing 16 changes…' },
        { view: () => hr(`${result('Import complete', '16 of 16 changes written. New hires get their accounts, groups and temporary passwords.')}
            ${stats([['3', 'Created', 'ok'], ['10', 'Updated or renamed'], ['2', 'Disabled'], ['1', 'Moved to leave']])}
            <div class="t-btns">${btn('Download password list (CSV)', { icon: 'key' })}${btn('Start another import')}</div>`),
          say: 'Done. Three new staff have accounts, two leavers are disabled and one person moved to the Leave OU. Day to day, this runs on a schedule and emails you the result.' },
      ],
    },
    {
      group: 'Directory', name: 'Group Actions', task: 'Clean up a group',
      steps: [
        { view: () => groupActions(false), target: 'run',
          say: 'Four disabled accounts are still in <b>Wi-Fi-Staff</b>. They\'re already selected with "Remove from this group". Click <b>Run</b>.' },
        { view: () => groupActions(false), dialog: bulkDialog, target: 'confirm-run',
          say: 'Every bulk action is review-then-run. Click <b>Run</b> to confirm.',
          log: { action: 'Bulk remove from group', target: 'Wi-Fi-Staff', detail: '4 disabled members removed · 4 succeeded' } },
        { view: () => groupActions(true), toast: '4 succeeded, 0 failed',
          say: 'Done. A result for every member, and each removal is in the audit log. The same page resets passwords, moves OUs or adds to another group in bulk.' },
      ],
    },
    {
      group: 'Directory', name: 'Disabled Cleanup', task: 'Delete old accounts',
      steps: [
        { view: () => cleanup('start'), target: 'scan',
          say: 'Accounts that have been disabled for a year are just clutter and risk. Click <b>Scan</b>.' },
        { view: () => cleanup('found'), target: 'select-all',
          say: 'Nothing is selected by default, so nobody gets deleted by accident. Click <b>Select all 6</b>.' },
        { view: () => cleanup('selected'), target: 'delete',
          say: 'Six accounts, each disabled for more than a year. Click <b>Delete 6 selected</b>.' },
        { view: () => cleanup('selected'), dialog: deleteDialog, target: 'confirm-delete',
          say: 'Deletion is permanent, so MADx asks once more. Click <b>Delete 6</b>.',
          log: { action: 'Delete disabled accounts', target: '6 accounts', detail: 'disabled 412 to 1,104 days' } },
        { view: () => cleanup('deleted'), toast: 'Deleted 6 account(s)',
          say: 'Done. Six stale accounts are gone, and the audit log lists every one by name.' },
      ],
    },
    {
      group: 'Cloud', name: 'Microsoft 365', task: 'Contain a risky sign-in',
      steps: [
        { view: () => entra(false), target: 'lockdown',
          say: 'Entra ID flagged a <b>high-risk sign-in</b> for mlopez at 6:58 AM. Click <b>Lock down</b>.' },
        { view: () => entra(false), dialog: lockdownDialog, target: 'confirm-lockdown',
          say: 'Lock down does four things at once. Leave them all on and click <b>Lock down account</b>.',
          log: { action: 'Lock down account', target: 'mlopez@district.org', detail: 'sessions revoked · MFA reset · password change · confirmed compromised' } },
        { view: () => entra(true), toast: 'Morgan Lopez is locked down',
          say: 'Done. Morgan is signed out everywhere, has to set up MFA again, and Entra ID marks the sign-in as compromised. No admin portals opened.' },
      ],
    },
    {
      group: 'Cloud', name: 'Google Workspace', task: 'Sign out everywhere',
      steps: [
        { view: () => google(false, false), target: 'open-google',
          say: 'Kim stayed signed in to Google on a laptop at family night. Open <b>Kim Patel</b>.' },
        { view: () => google(true, false), target: 'signout',
          say: 'Suspend, reset and sign out sit on one panel. Click <b>Sign out everywhere</b>.' },
        { view: () => google(true, false), dialog: signoutDialog, target: 'confirm-signout',
          say: 'Click <b>Sign out</b> to end all of Kim\'s Google sessions.',
          log: { action: 'Google: sign out everywhere', target: 'kpatel@district.org', detail: '3 sessions revoked' } },
        { view: () => google(true, true), toast: 'Signed kpatel out everywhere',
          say: 'Done. That laptop is signed out, and Kim just signs in again at school. No Google Admin console needed.' },
      ],
    },
    {
      group: 'Cloud', name: 'Exchange', task: 'Offboard a mailbox',
      steps: [
        { view: () => mailbox(false), target: 'offboard',
          say: 'Riley retired, and the mailbox still forwards to a personal address. Click <b>Offboard mailbox…</b>.' },
        { view: () => mailbox(false), dialog: offboardDialog, target: 'confirm-offboard',
          say: 'Five steps that usually take three admin centers. Click <b>Offboard</b>.',
          log: { action: 'Offboard mailbox', target: 'rpark@district.org', detail: 'forwarding cleared · shared · Kim Patel full access · auto-reply · hidden' } },
        { view: () => mailbox(true), toast: "Riley Park's mailbox is offboarded",
          say: 'Done. The mail stays without a license, Kim can read it in Outlook, and senders get a reply pointing them to Kim.' },
      ],
    },
    {
      group: 'Operations', name: 'Files', task: 'Hand over a leaver\'s files',
      steps: [
        { view: () => files('', filesFoot('Pick Share or Copy.')), target: 'copy',
          nudge: { share: 'Share works too, but Kim loses access when Riley\'s account is deleted. For this tour, pick <b>Copy</b>.' },
          say: 'Riley Park retired. MADx filled in Riley\'s manager, Kim Patel, to receive the files. Choose how: click <b>Copy</b>.' },
        { view: () => files('copy', filesFoot('Ready: copy OneDrive and home folder to Kim Patel.')), target: 'start-handover',
          say: 'Everything goes into a "From Riley Park" folder that Kim owns. Click <b>Start hand-over</b>.',
          log: { action: 'Files hand-over', target: 'rpark → kpatel', detail: 'copy · OneDrive and home folder · recipient emailed' } },
        { view: () => files('copy', `<div class="t-body t-tight">${run('Hand-over running', 'Copying 1,284 OneDrive files, then the home folder…', 2000)}</div>`), auto: 2000,
          say: 'Copying 1,284 OneDrive files, then the home folder. You can keep using MADx while it runs.' },
        { view: () => files('copy', `<div class="t-body t-tight">${result('Hand-over complete', 'Kim Patel has a "From Riley Park" folder with 1,284 OneDrive files and the home folder, and an email with the links.')}</div>`),
          say: 'Done. Kim has Riley\'s files in a folder of Kim\'s own, and nothing was deleted.' },
      ],
    },
    {
      group: 'Operations', name: 'AI assistant', task: 'Ask in plain English',
      steps: [
        { view: () => assistant(starters()), target: 'ask',
          say: 'The assistant runs on <b>your own AI server</b> and sees only what you can see. Click <b>Why can\'t someone sign in?</b>' },
        { view: () => assistant(`${question}<p class="t-msg-ai t-typing" aria-label="Thinking"><span></span><span></span><span></span> Checking AD, Entra ID and sign-in logs</p>`), auto: 1600,
          say: 'Looking up sortiz in AD, Entra ID and the sign-in logs…' },
        { view: () => assistant(answer('ask')), target: 'confirm-ai',
          say: 'It found the cause and proposed a fix. Nothing changes until you confirm. Click <b>Reset password</b> on the card.',
          log: { action: 'Assistant action: reset password', target: 'sortiz', detail: 'unlocked · change at next sign-in', assistant: true } },
        { view: () => assistant(answer('done')),
          say: 'Done. The assistant reset Sam\'s password and unlocked the account using your permissions, and logged it as an assistant action.' },
      ],
    },
    {
      group: 'Operations', name: 'Devices', task: 'Find a lost iPad',
      steps: [
        { view: () => devices(false, false), target: 'open-ipad',
          say: 'A 2nd grader left an iPad on the bus. Open <b>LES-IPAD-0377</b>.' },
        { view: () => devices(true, false), target: 'lost',
          say: 'Intune and Mosyle devices share one panel. Click <b>Lost Mode…</b> to lock it with a message.' },
        { view: () => devices(true, false), dialog: lostDialog, target: 'confirm-lost',
          say: 'This is what the finder will see. Click <b>Enable Lost Mode</b>.',
          log: { action: 'Enable Lost Mode', target: 'LES-IPAD-0377', detail: 'Mosyle · message and phone set' } },
        { view: () => devices(true, true), toast: 'Lost Mode is on', target: 'sound',
          say: 'The iPad is locked and reported where it is. Click <b>Play sound</b> so the driver can find it.',
          log: { action: 'Play sound', target: 'LES-IPAD-0377', detail: 'Mosyle' } },
        { view: () => devices(true, true), toast: 'Playing a sound on LES-IPAD-0377',
          say: 'Done. The iPad is locked with your message, located, and beeping under a bus seat.' },
      ],
    },
    {
      group: 'Operations', name: 'Printers', task: 'Clear a stuck queue',
      steps: [
        { view: () => printers(false, false), target: 'open-printer',
          say: 'The Room 114 copier at Lincoln has 16 jobs stuck behind an error. Open <b>LES-114-COPIER</b>.' },
        { view: () => printers(true, false), target: 'clear',
          say: 'The first job errored and is holding up the rest. Click <b>Clear all</b>.' },
        { view: () => printers(true, false), dialog: clearDialog, target: 'confirm-clear',
          say: 'Confirm it. No remote desktop, no Print Management console.',
          log: { action: 'Clear print queue', target: 'LES-114-COPIER', detail: '16 jobs deleted · PRINT01' } },
        { view: () => printers(false, true), toast: 'Queue cleared on LES-114-COPIER',
          say: 'Done. The copier is back to Ready, with no remote session to any print server.' },
      ],
    },
    {
      group: 'Operations', name: 'DNS', task: 'Add a record',
      steps: [
        { view: () => dnsRecords(false), target: 'add-record',
          say: 'The new badge printer needs a name. Click <b>Add record</b>.' },
        { view: () => dnsRecords(false), dialog: dnsDialog, target: 'confirm-record',
          say: 'An A record and its PTR in one go. Click <b>Add record</b>.',
          log: { action: 'Add DNS record', target: 'badge-printer.district.org', detail: 'A 10.20.30.45 · with PTR' } },
        { view: () => dnsRecords(true), toast: 'Added A badge-printer.district.org → 10.20.30.45 (with PTR)', target: 'lookup',
          say: 'Has it replicated yet? Open the <b>Lookup</b> view.' },
        { view: () => dnsLookup(false), target: 'ask-dns',
          say: 'Click <b>Ask every server</b> to ask each DNS server the same question.' },
        { view: () => dnsLookup(true),
          say: 'Done. All three servers already agree, so you know the change is everywhere without opening DNS Manager on each one.' },
      ],
    },
    {
      group: 'Operations', name: 'DHCP', task: 'Reserve an address',
      steps: [
        { view: () => dhcp(false), target: 'reserve',
          say: 'The Room 114 copier keeps changing IP. MADx found its lease by MAC across every server. Click <b>Convert to reservation</b>.' },
        { view: () => dhcp(false), dialog: reserveDialog, target: 'confirm-reserve',
          say: 'Everything is filled in from the lease. Click <b>Add</b>.',
          log: { action: 'Add DHCP reservation', target: '10.20.14.40', detail: 'LES-114-COPIER · replicated to failover partner' } },
        { view: () => dhcp(true), toast: 'Saved to DHCP01 and replicated to the failover partner',
          say: 'Done. Saved on the failover primary and replicated, so the copier keeps its address whichever server answers.' },
      ],
    },
    {
      group: 'Operations', name: 'Network Monitor', task: 'Find a switch port',
      steps: [
        { view: () => monitor('start'), target: 'find-port',
          say: 'The Room 114 access point is down. Which switch port is it on? Click <b>Find port</b>.' },
        { view: () => monitor('found'), target: 'poe',
          say: 'Found it, and the port shows no power draw. Click <b>Power-cycle PoE</b>.' },
        { view: () => monitor('found'), dialog: poeDialog, target: 'confirm-poe',
          say: 'Click <b>Power-cycle</b>. No walk to the closet.',
          log: { action: 'Power-cycle PoE', target: 'LES-IDF1-SW2 Gi1/0/14', detail: 'LES-AP-114 rejoined' } },
        { view: () => monitor('fixed'), toast: 'LES-AP-114 is back up',
          say: 'Done. The access point powered back up and rejoined. MADx watches switches, wireless, UPSes and toner from any vendor over SNMP.' },
      ],
    },
    {
      group: 'Operations', name: 'Quick Links', task: 'Pin a vendor portal',
      steps: [
        { view: () => quickLinks(false), target: 'pin',
          say: 'Every console and vendor portal your team uses, with notes for techs. Pin <b>Mosyle Manager</b> to the top for yourself.' },
        { view: () => quickLinks(true), toast: 'Pinned for you',
          say: 'Done. Pins are per person, so each tech keeps their own short list.' },
      ],
    },
    {
      group: 'Operations', name: 'System Health', task: 'Check every dependency',
      steps: [
        { view: () => health('start'), target: 'rerun',
          say: 'MADx checks everything it depends on. Click <b>Re-run all checks</b>.' },
        { view: () => health('running'), auto: 1400,
          say: 'Checking Active Directory, Microsoft Graph, Google Workspace, the mail relay and the audit log…' },
        { view: () => health('done'),
          say: 'Done. Four checks pass and one warns that the Graph app secret expires in 21 days, weeks before anything breaks. The daily check emails you too.' },
      ],
    },
    {
      group: 'Operations', name: 'Settings', task: 'Give the front office access',
      steps: [
        { view: () => settings('start'), target: 'add-grant',
          say: 'Let the Lincoln front office reset passwords, and nothing else. Click <b>Add grant</b> for the LES-Office group.' },
        { view: () => settings('added'), target: 'save',
          say: 'Four pages are ticked, and resets are limited to members of LES-Staff. Tick anything else you like, then click <b>Save access &amp; modules</b>.',
          log: { action: 'Access grant added', target: 'LES-Office', detail: '4 permissions · password reset limited to LES-Staff' } },
        { view: () => settings('saved'), toast: 'Access & modules saved',
          say: 'Done. The office can now reset Lincoln staff passwords, nothing else is visible to them, and the change is in the audit log.' },
      ],
    },
  ];
  const AUDIT = { group: 'Operations', name: 'Audit log', task: 'See what you just did' };

  // ---- Mount ---------------------------------------------------------------------------
  function mount(host) {
    const demoHref = host.dataset.demoHref || '#demo';
    const log = [];
    const done = new Set();
    let stop = 0, step = 0, token = 0, nudge = '';

    host.classList.add('tour-host');
    host.innerHTML = `
      <div class="tour">
        <nav class="tour-rail" aria-label="Tour stops">
          <p class="tour-rail-head"><span>Guided tour</span><span class="tour-progress"></span></p>
          <ol></ol>
        </nav>
        <div class="tour-stage">
          <div class="tour-coach">
            <div class="tour-coach-top"></div>
            <p class="tour-say" aria-live="polite"></p>
            <div class="tour-coach-actions"></div>
            <p class="tour-nudge" role="status"></p>
          </div>
          <div class="t-app" role="group" aria-label="MADx app demo with made-up data"></div>
        </div>
      </div>`;
    const railBox = host.querySelector('.tour-rail');
    const rail = railBox.querySelector('ol');
    const progress = host.querySelector('.tour-progress');
    const coach = host.querySelector('.tour-coach');
    const [coachTop, coachSay, coachActions, coachNudge] = coach.children;
    const app = host.querySelector('.t-app');

    const isAudit = () => stop === STOPS.length;
    const current = () => (isAudit() ? null : STOPS[stop].steps[step]);

    // Stops are grouped like the app's own navigation; a heading starts each group.
    function renderRail() {
      rail.innerHTML = [...STOPS, AUDIT].map((s, i, all) => `
        ${i === 0 || s.group !== all[i - 1].group ? `<li class="tour-group" role="presentation">${s.group}</li>` : ''}
        <li><button type="button" class="tour-stop${done.has(i) ? ' is-done' : ''}" data-stop="${i}"${i === stop ? ' aria-current="step"' : ''}>
          <span class="tour-stop-num">${done.has(i) ? ic('check') : i === STOPS.length ? ic('log') : i + 1}</span>
          <strong>${s.name}</strong><small>${s.task}</small>
        </button></li>`).join('');
      progress.textContent = `${[...done].filter((i) => i < STOPS.length).length} of ${STOPS.length} done`;
      // Keep the current stop in view: the list scrolls down beside the app when wide, and
      // sideways above it when narrow.
      const c = rail.querySelector('[aria-current]').getBoundingClientRect();
      rail.scrollLeft += c.left - rail.getBoundingClientRect().left - 12;
      const box = railBox.getBoundingClientRect();
      if (c.top < box.top || c.bottom > box.bottom) railBox.scrollTop += c.top - box.top - box.height / 3;
    }

    function renderCoach() {
      const st = current();
      const next = STOPS[stop + 1] || AUDIT;
      let kicker, say, actions = '';
      if (isAudit()) {
        kicker = 'Audit log';
        say = log.length
          ? `Every click you made is here: ${log.length} ${log.length === 1 ? 'action' : 'actions'}, each with who did it and when. Want to see MADx on your own directory?`
          : 'Everything a technician changes in MADx lands here, with who and when. Try a tool first and your actions show up.';
        actions = `<a class="tour-next" href="${demoHref}">Request a demo</a><button type="button" class="tour-alt" data-restart>Start over</button>`;
      } else {
        const targets = STOPS[stop].steps.filter((s) => s.target);
        const k = targets.indexOf(st) + 1;
        kicker = `${STOPS[stop].name} · ${st.target ? `Step ${k} of ${targets.length}` : st.auto ? 'Working' : 'Done'}`;
        say = st.say;
        if (!st.target && !st.auto) {
          actions = `<button type="button" class="tour-next" data-next>${stop === STOPS.length - 1 ? 'See your audit log' : `Next: ${next.name}`}${ic('arrow')}</button>`;
        }
      }
      const skip = !isAudit() && (st.target || st.auto) ? `<button type="button" class="tour-skip" data-next>Skip to ${next.name}</button>` : '';
      // The hint and nudge elements stay in place so screen readers announce each change.
      coachTop.innerHTML = `<span class="tour-kicker">${kicker}</span>${skip}`;
      coachSay.innerHTML = say;
      coachActions.innerHTML = actions;
      coachActions.hidden = !actions;
      coachNudge.innerHTML = nudge;
    }

    function banner(query) {
      return `<div class="t-banner">
        <span class="t-wordmark">MAD<span>x</span></span>
        <button type="button" class="t-search${query ? ' has-q' : ''}" data-t="search">${ic('search')}<span>${query || 'Search users, devices, IPs, MACs, printers…'}</span><kbd>/</kbd></button>
        <button type="button" class="t-sync">${ic('sync')}<span>Sync now</span></button>
        <span class="t-upn">you@district.org</span>
      </div>`;
    }

    function render(follow) {
      const st = current();
      if (st && !st.target && !st.auto) done.add(stop);
      if (isAudit()) done.add(STOPS.length);
      app.innerHTML = `${banner(st && st.query)}
        <div class="t-page">${st ? st.view() : audit(log)}</div>
        ${st && st.dialog ? `<div class="t-scrim">${st.dialog()}</div>` : ''}
        ${st && st.toast ? `<div class="t-toast" role="status">${ic('check')}<span>${st.toast}</span></div>` : ''}`;
      renderRail();
      renderCoach();

      const target = st && st.target ? app.querySelector(`[data-t="${st.target}"]`) : null;
      if (target) {
        target.classList.add('t-target');
        // Bring it into view inside its own scroller (the page or a tall dialog), never the window.
        const scroller = target.closest('.t-dialog') || (target.closest('.t-foot, .t-banner') ? null : app.querySelector('.t-page'));
        if (scroller) {
          const r = target.getBoundingClientRect(), p = scroller.getBoundingClientRect();
          const sticky = scroller.querySelector(':scope > .t-foot, :scope > .t-composer');
          const bottom = p.bottom - (sticky ? sticky.offsetHeight : 0) - 8;
          if (r.bottom > bottom || r.top < p.top) scroller.scrollTop += r.top - p.top - p.height / 3;
        }
      }
      if (follow) {
        const focusable = target || coach.querySelector('.tour-next');
        if (focusable) focusable.focus({ preventScroll: true });
      }
    }

    function go(i, j = 0, follow = false) {
      token += 1;
      const mine = token;
      stop = i; step = j; nudge = '';
      render(follow);
      const st = current();
      if (st && st.auto) {
        window.setTimeout(() => { if (mine === token) go(stop, step + 1, follow); }, reduceMotion ? 600 : st.auto);
      }
    }

    app.addEventListener('click', (e) => {
      const st = current();
      const el = e.target.closest('button');
      if (!el || el.disabled) return;
      if (st && st.target && el.dataset.t === st.target) {
        if (st.log) log.push({ time: clock(), ...st.log });
        go(stop, step + 1, true);
        return;
      }
      const role = el.getAttribute('role');
      if (role === 'switch' || role === 'checkbox') {
        el.setAttribute('aria-checked', String(el.getAttribute('aria-checked') !== 'true'));
        return;
      }
      nudge = (st && st.nudge && st.nudge[el.dataset.t])
        || (st && st.target ? 'That works in the real app. In this tour, follow the highlighted control.'
          : 'That works in the real app. This task is done, so use the button above to keep going.');
      renderCoach();
    });

    coach.addEventListener('click', (e) => {
      if (e.target.closest('[data-next]')) go(stop + 1, 0, true);
      else if (e.target.closest('[data-restart]')) { log.length = 0; done.clear(); go(0, 0, true); }
    });

    rail.addEventListener('click', (e) => {
      const b = e.target.closest('[data-stop]');
      if (b) go(Number(b.dataset.stop));
    });

    go(0);
  }

  document.querySelectorAll('[data-madx-tour]').forEach(mount);
})();
