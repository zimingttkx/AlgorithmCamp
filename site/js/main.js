const CHAPTERS = [
  { id: 'chapter-01', title: '滑动窗口与双指针', short: '滑动窗口', file: 'docs/chapter-01.md', color: '#3a8a2a', light: '#7cc427' },
  { id: 'chapter-02', title: '二分算法',         short: '二分算法',   file: 'docs/chapter-02.md', color: '#1a5a9a', light: '#4da6ff' },
  { id: 'chapter-03', title: '单调栈',           short: '单调栈',     file: 'docs/chapter-03.md', color: '#7a4a1a', light: '#c87030' },
  { id: 'chapter-04', title: '网格图',           short: '网格图',     file: 'docs/chapter-04.md', color: '#1a7a4a', light: '#30c870' },
  { id: 'chapter-05', title: '位运算',           short: '位运算',     file: 'docs/chapter-05.md', color: '#6a1a7a', light: '#c030e0' },
  { id: 'chapter-06', title: '图论算法',         short: '图论',       file: 'docs/chapter-06.md', color: '#7a1a2a', light: '#e03050' },
  { id: 'chapter-07', title: '动态规划',         short: '动态规划',   file: 'docs/chapter-07.md', color: '#1a4a7a', light: '#3090e0' },
  { id: 'chapter-08', title: '常用数据结构',     short: '数据结构',   file: 'docs/chapter-08.md', color: '#5a5a1a', light: '#c0c030' },
  { id: 'chapter-09', title: '数学算法',         short: '数学',       file: 'docs/chapter-09.md', color: '#1a6a6a', light: '#30c0c0' },
  { id: 'chapter-10', title: '贪心与思维',       short: '贪心',       file: 'docs/chapter-10.md', color: '#7a3a1a', light: '#e07030' },
  { id: 'chapter-11', title: '链表、树与回溯',   short: '链表/树',    file: 'docs/chapter-11.md', color: '#2a6a1a', light: '#50c030' },
  { id: 'chapter-12', title: '字符串',           short: '字符串',     file: 'docs/chapter-12.md', color: '#4a1a6a', light: '#9030c0' },
];

// Bubble positions (% of container, 4-column grid with offsets)
const BUBBLE_POSITIONS = [
  { x: 8,  y: 15 }, { x: 28, y: 8  }, { x: 50, y: 14 }, { x: 70, y: 7  },
  { x: 15, y: 42 }, { x: 37, y: 36 }, { x: 60, y: 40 }, { x: 80, y: 34 },
  { x: 8,  y: 66 }, { x: 30, y: 62 }, { x: 52, y: 68 }, { x: 73, y: 60 },
];

let currentChapter = null;
let mdCache = {};

// ── Entry Screen ──
function startEntry() {
  const bar = document.getElementById('entry-bar');
  const label = document.getElementById('entry-label');
  const btn = document.getElementById('enter-btn');
  let pct = 0;
  const iv = setInterval(() => {
    pct += Math.random() * 9 + 3;
    if (pct >= 100) { pct = 100; clearInterval(iv); }
    bar.style.width = pct + '%';
    label.textContent = pct < 100 ? 'Loading... ' + Math.floor(pct) + '%' : 'Ready!';
    if (pct >= 100) setTimeout(() => { btn.style.display = 'inline-block'; }, 300);
  }, 70);
}

function enterApp() {
  document.getElementById('entry-screen').classList.add('hidden');
  const app = document.getElementById('app');
  app.style.display = 'block';
  setTimeout(() => { document.getElementById('entry-screen').style.display = 'none'; }, 700);
  buildBubbleMap();
  buildMiniNav();
  updateGlobalProgress();
}

// ── Progress ──
function getProgress(id) { return JSON.parse(localStorage.getItem(id + '-progress') || '{}'); }
function saveProgress(id, pid, checked) {
  const p = getProgress(id);
  if (checked) p[pid] = true; else delete p[pid];
  localStorage.setItem(id + '-progress', JSON.stringify(p));
}
function countDone(id) { return Object.keys(getProgress(id)).length; }

// ── Bubble Map ──
function buildBubbleMap() {
  const container = document.getElementById('bubble-container');
  container.innerHTML = '';
  let totalDone = 0;
  CHAPTERS.forEach((ch, i) => {
    const done = countDone(ch.id);
    totalDone += done;
    const totals = JSON.parse(localStorage.getItem('_chapterTotals') || '{}');
    const total = totals[ch.id] || 0;
    const pct = total > 0 ? Math.round(done / total * 100) : 0;
    const pos = BUBBLE_POSITIONS[i];

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.dataset.id = ch.id;
    bubble.style.left = pos.x + '%';
    bubble.style.top = pos.y + '%';
    bubble.style.setProperty('--bubble-color', ch.color);
    bubble.style.setProperty('--bubble-light', ch.light);
    bubble.style.animationDelay = (i * 0.18) + 's';

    bubble.innerHTML = `
      <div class="bubble-inner">
        <div class="bubble-num">${String(i+1).padStart(2,'0')}</div>
        <div class="bubble-name">${ch.short}</div>
        ${total > 0 ? `<div class="bubble-prog">${pct}%</div>` : ''}
        ${done > 0 ? '<div class="bubble-check">&#x2714;</div>' : ''}
      </div>
      <div class="bubble-particles"></div>
    `;

    bubble.addEventListener('mouseenter', spawnParticles);
    bubble.addEventListener('click', () => selectBubble(ch, bubble));
    container.appendChild(bubble);
  });
  document.getElementById('map-global-done').textContent = totalDone;
}

function spawnParticles(e) {
  const wrap = this.querySelector('.bubble-particles');
  wrap.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = (20 + Math.random() * 60) + '%';
    p.style.animationDelay = (Math.random() * 0.3) + 's';
    wrap.appendChild(p);
  }
}

function selectBubble(ch, bubble) {
  bubble.classList.add('pop');
  setTimeout(() => {
    showChapterView();
    loadChapter(ch);
  }, 320);
}

function showChapterView() {
  document.getElementById('map-view').style.display = 'none';
  document.getElementById('chapter-view').style.display = 'flex';
}

function backToMap() {
  document.getElementById('chapter-view').style.display = 'none';
  document.getElementById('map-view').style.display = 'flex';
  buildBubbleMap();
}

// ── Mini Nav ──
function buildMiniNav() {
  const list = document.getElementById('mini-nav-list');
  list.innerHTML = '';
  CHAPTERS.forEach((ch, i) => {
    const done = countDone(ch.id);
    const d = document.createElement('div');
    d.className = 'mini-nav-item';
    d.dataset.id = ch.id;
    d.style.setProperty('--bubble-light', ch.light);
    d.innerHTML = `<span class="mini-num">${String(i+1).padStart(2,'0')}</span>
      <span class="mini-title">${ch.short}</span>
      ${done > 0 ? `<span class="mini-done">${done}</span>` : ''}`;
    d.addEventListener('click', () => loadChapter(ch));
    list.appendChild(d);
  });
}

function updateGlobalProgress() {
  const totals = JSON.parse(localStorage.getItem('_chapterTotals') || '{}');
  const globalTotal = Object.values(totals).reduce((a,b)=>a+b,0);
  let totalDone = 0;
  CHAPTERS.forEach(ch => { totalDone += countDone(ch.id); });
  const pct = globalTotal > 0 ? Math.round(totalDone / globalTotal * 100) : 0;
  const el = document.getElementById('global-pct');
  const bar = document.getElementById('global-progress');
  if (el) el.textContent = pct + '%';
  if (bar) bar.style.width = pct + '%';
  const mapDone = document.getElementById('map-global-done');
  if (mapDone) mapDone.textContent = totalDone;
}

// ── Rating Tag ──
function ratingTag(r) {
  if (!r || r === '—') return '<span class="rating-tag">—</span>';
  const n = parseInt(r);
  const cls = n < 1600 ? 'r-low' : n < 2000 ? 'r-med' : 'r-high';
  return `<span class="rating-tag ${cls}">${r}</span>`;
}

// ── Parse MD ──
function parseMdTables(md) {
  const sections = [];
  const lines = md.split('\n');
  let curH2 = '', curH3 = '', curTable = [];
  function flush() {
    if (curTable.length > 0) { sections.push({ h2: curH2, h3: curH3, rows: [...curTable] }); curTable = []; }
  }
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith('## '))      { flush(); curH2 = t.replace(/^##\s+/,''); curH3=''; }
    else if (t.startsWith('### ')){ flush(); curH3 = t.replace(/^###\s+/,''); }
    else if (t.startsWith('#### ')){ flush(); curH3 = t.replace(/^####\s+/,''); }
    else if (t.startsWith('|') && !t.startsWith('|---')) {
      const cells = t.split('|').map(c=>c.trim()).filter(c=>c);
      if (cells.length >= 2 && cells[0] !== '题号' && cells[0] !== '#') {
        const num = cells[0], titleCell = cells[1]||'', rating = cells[2]||'—';
        const lm = titleCell.match(/\[([^\]]+)\]\(([^)]+)\)/);
        let title = titleCell, url = '';
        if (lm) { title = lm[1]; url = lm[2]; }
        const isMember = title.includes('🔒');
        title = title.replace('🔒','').trim();
        const probId = String(num).replace(/[^a-zA-Z0-9]/g,'_');
        curTable.push({ num, title, url, rating: rating==='—'?'':rating, isMember, probId });
      }
    }
  }
  flush();
  return sections;
}

// ── Build Content ──
function buildContent(chapterId, sections) {
  const progress = getProgress(chapterId);
  let html = '', total = 0;
  let lastH2 = '', lastH3 = '', openTable = false;
  function closeTable() { if (openTable) { html += '</tbody></table>'; openTable = false; } }
  sections.forEach(sec => {
    if (sec.h2 !== lastH2) { closeTable(); html += `<div class="section-h2">${escHtml(sec.h2)}</div>`; lastH2=sec.h2; lastH3=''; }
    if (sec.h3 !== lastH3) { closeTable(); if(sec.h3) html += `<div class="section-h3">${escHtml(sec.h3)}</div>`; lastH3=sec.h3; }
    if (sec.rows.length > 0) {
      html += `<table class="problem-table"><thead><tr><th class="prob-check"></th><th class="prob-num">#</th><th class="prob-title">题目</th><th class="prob-rating">难度分</th></tr></thead><tbody>`;
      openTable = true;
      sec.rows.forEach(row => {
        total++;
        const done = progress[row.probId] ? 'done' : '';
        const checked = progress[row.probId] ? 'checked' : '';
        const link = row.url ? `<a href="${row.url}" target="_blank" rel="noopener">${escHtml(row.title)}</a>` : escHtml(row.title);
        const member = row.isMember ? '<span class="member-tag">会员</span>' : '';
        html += `<tr class="${done}" data-id="${escHtml(row.probId)}"><td class="prob-check"><input type="checkbox" ${checked} data-chapter="${chapterId}" data-id="${escHtml(row.probId)}"></td><td class="prob-num">${escHtml(row.num)}</td><td class="prob-title">${link}${member}</td><td class="prob-rating">${ratingTag(row.rating)}</td></tr>`;
      });
      closeTable();
    }
  });
  closeTable();
  return { html, total };
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}


// ── Load Chapter ──
async function loadChapter(chapter) {
  currentChapter = chapter;
  document.querySelectorAll('.mini-nav-item').forEach(el =>
    el.classList.toggle('active', el.dataset.id === chapter.id));
  const main = document.getElementById('main');
  main.innerHTML = '<div class="mc-loading">加载中...</div>';

  let md;
  if (mdCache[chapter.id]) { md = mdCache[chapter.id]; }
  else {
    try {
      const r = await fetch(chapter.file);
      md = await r.text();
      mdCache[chapter.id] = md;
    } catch(e) {
      main.innerHTML = `<div class="mc-loading">加载失败: ${e.message}</div>`;
      return;
    }
  }

  const srcMatch = md.match(/\[.*?\]\((https?:\/\/[^)]+)\)/);
  const sourceUrl = srcMatch ? srcMatch[1] : '#';
  const sections = parseMdTables(md);
  const { html, total } = buildContent(chapter.id, sections);
  const done = countDone(chapter.id);
  const pct = total > 0 ? Math.round(done / total * 100) : 0;
  const chNum = chapter.id.replace('chapter-', '');

  // Cache totals for global progress
  const allTotals = JSON.parse(localStorage.getItem('_chapterTotals') || '{}');
  allTotals[chapter.id] = total;
  localStorage.setItem('_chapterTotals', JSON.stringify(allTotals));

  main.innerHTML = `
    <div id="content-header" style="--ch-light:${chapter.light}">
      <h2>Chapter ${chNum} · ${escHtml(chapter.title)}</h2>
      <div class="meta">题单来源：<a href="${sourceUrl}" target="_blank" rel="noopener">灵茶山艾府（仅供学习参考）</a></div>
      <div class="stats-bar">
        <div class="stat-pill">共 <span>${total}</span> 题</div>
        <div class="stat-pill">已完成 <span id="done-count">${done}</span> 题</div>
        <div class="stat-pill">完成率 <span id="done-pct">${pct}%</span></div>
      </div>
      <div class="chapter-progress-wrap">
        <div class="mc-progress-outer" style="flex:1">
          <div class="mc-progress-inner" id="chapter-prog" style="width:${pct}%;background:${chapter.light}"></div>
        </div>
        <span class="pct-label" id="pct-lbl">${pct}%</span>
      </div>
    </div>
    <div id="problem-list">${html}</div>
  `;

  main.querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', function() {
      const row = this.closest('tr');
      if (this.checked) row.classList.add('done'); else row.classList.remove('done');
      saveProgress(this.dataset.chapter, this.dataset.id, this.checked);
      updateStats();
      updateGlobalProgress();
      buildMiniNav();
      document.querySelectorAll('.mini-nav-item').forEach(el =>
        el.classList.toggle('active', el.dataset.id === chapter.id));
    });
  });

  updateStats();
  updateGlobalProgress();
}

function updateStats() {
  const total = document.querySelectorAll('#problem-list input[type=checkbox]').length;
  const done  = document.querySelectorAll('#problem-list input[type=checkbox]:checked').length;
  const pct   = total > 0 ? Math.round(done / total * 100) : 0;
  const dc = document.getElementById('done-count');
  const dp = document.getElementById('done-pct');
  const cp = document.getElementById('chapter-prog');
  const pl = document.getElementById('pct-lbl');
  if (dc) dc.textContent = done;
  if (dp) dp.textContent = pct + '%';
  if (cp) cp.style.width = pct + '%';
  if (pl) pl.textContent = pct + '%';
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  startEntry();
});
