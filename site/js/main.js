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

// ── Skeleton Screen Controller ──
function hideSkeleton() {
  const skeleton = document.getElementById('skeleton-screen');
  if (skeleton) {
    skeleton.classList.add('skeleton-hidden');
    setTimeout(() => { skeleton.style.display = 'none'; }, 600);
  }
}

function updateSkeletonProgress(pct) {
  const bar = document.getElementById('skeleton-bar');
  const label = document.getElementById('skeleton-label');
  if (bar) bar.style.width = pct + '%';
  if (label) label.textContent = pct < 100 ? 'Loading... ' + Math.floor(pct) + '%' : 'Ready!';
}

// ── Entry Screen ──
function startEntry() {
  const bar = document.getElementById('entry-bar');
  const label = document.getElementById('entry-label');
  const btn = document.getElementById('enter-btn');
  let pct = 0;
  loadProfile();
  const iv = setInterval(() => {
    pct += Math.random() * 9 + 3;
    if (pct >= 100) { pct = 100; clearInterval(iv); }
    bar.style.width = pct + '%';
    label.textContent = pct < 100 ? 'Loading... ' + Math.floor(pct) + '%' : 'Ready!';
    // Update skeleton progress too
    updateSkeletonProgress(pct);
    if (pct >= 100) {
      setTimeout(() => {
        hideSkeleton();
        btn.style.display = 'inline-block';
      }, 300);
    }
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


// ── Profile ──
const GITHUB_USER = 'zimingttkx';
const REPO_DATA = [
  { name: 'AI-Practices', desc: '机器学习与深度学习实战教程 | Comprehensive ML & DL Tutorial with Jupyter Notebooks', stars: 403, forks: 62, lang: 'Jupyter Notebook', url: 'https://github.com/zimingttkx/AI-Practices' },
  { name: 'Network-Security-Based-On-ML', desc: '基于机器学习的网络安全检测系统 | 集成Kitsune/LUCID算法 | 99.58%攻击检测准确率', stars: 153, forks: 0, lang: 'Python', url: 'https://github.com/zimingttkx/Network-Security-Based-On-ML' },
  { name: 'cpp-from-scratch', desc: 'c++20 from-scratch implementations: LRU/LFU/ARC cache, red-black tree, memory pool, GC and more.', stars: 47, forks: 0, lang: 'C++', url: 'https://github.com/zimingttkx/cpp-from-scratch' },
  { name: 'AlgorithmCamp', desc: '个人算法刷题进度追踪网站，基于灵茶山艾府题单', stars: 0, forks: 0, lang: 'CSS', url: 'https://github.com/zimingttkx/AlgorithmCamp' },
];

function loadProfile() {
  // Static data we already know
  document.getElementById('profile-name').textContent = 'zimingttkx';
  document.getElementById('profile-login').textContent = '@zimingttkx';
  document.getElementById('profile-bio').textContent = '算法 · 机器学习 · 网络安全 · C++';
  document.getElementById('profile-link').href = 'https://github.com/' + GITHUB_USER;
  document.getElementById('stat-repos').textContent = '4';
  const totalStars = REPO_DATA.reduce((s, r) => s + r.stars, 0);
  document.getElementById('stat-stars').textContent = totalStars;

  // Load LeetCode profile
  loadLeetCodeProfile();

  // Fetch live data from GitHub API
  fetch('https://api.github.com/users/' + GITHUB_USER)
    .then(r => r.json())
    .then(data => {
      if (data.login) {
        document.getElementById('profile-name').textContent = data.name || data.login;
        document.getElementById('profile-login').textContent = '@' + data.login;
        if (data.bio) document.getElementById('profile-bio').textContent = data.bio;
        document.getElementById('profile-avatar').src = data.avatar_url;
        document.getElementById('stat-repos').textContent = data.public_repos;
        document.getElementById('stat-followers').textContent = data.followers;
        document.getElementById('stat-following').textContent = data.following;
      }
    }).catch(() => {});

  // Fetch repos live
  fetch('https://api.github.com/users/' + GITHUB_USER + '/repos?sort=stars&per_page=8')
    .then(r => r.json())
    .then(repos => {
      if (!Array.isArray(repos)) return;
      const stars = repos.reduce((s, r) => s + r.stargazers_count, 0);
      document.getElementById('stat-stars').textContent = stars;
      renderRepos(repos.map(r => ({
        name: r.name, desc: r.description || '', stars: r.stargazers_count,
        forks: r.forks_count, lang: r.language || '', url: r.html_url
      })));
    }).catch(() => renderRepos(REPO_DATA));

  // Fetch events
  fetch('https://api.github.com/users/' + GITHUB_USER + '/events/public?per_page=15')
    .then(r => r.json())
    .then(events => { if (Array.isArray(events)) renderEvents(events); })
    .catch(() => {
      document.getElementById('events-list').innerHTML = '<div class="profile-loading">暂无动态数据（GitHub API 限流）</div>';
    });

  // Render static repos as fallback immediately
  renderRepos(REPO_DATA);
}

function renderRepos(repos) {
  const grid = document.getElementById('repo-grid');
  if (!repos.length) { grid.innerHTML = '<div class="profile-loading">暂无仓库</div>'; return; }
  grid.innerHTML = repos.map(r => `
    <div class="repo-card">
      <div class="repo-card-name"><a href="${r.url}" target="_blank" rel="noopener">${escHtml(r.name)}</a></div>
      <div class="repo-card-desc">${escHtml(r.desc || '—')}</div>
      <div class="repo-card-meta">
        <span class="repo-star">&#x2605; ${r.stars}</span>
        ${r.forks ? `<span class="repo-fork">&#x2442; ${r.forks}</span>` : ''}
        ${r.lang ? `<span class="repo-lang">${escHtml(r.lang)}</span>` : ''}
      </div>
    </div>
  `).join('');
}

function renderEvents(events) {
  const list = document.getElementById('events-list');
  const items = events.slice(0, 10).map(e => {
    let icon = '&#x1F4C4;', desc = '';
    if (e.type === 'PushEvent') {
      icon = '&#x1F4E4;';
      const commits = e.payload.commits || [];
      desc = commits.length ? escHtml(commits[commits.length-1].message.split('\n')[0]) : 'Push';
    } else if (e.type === 'CreateEvent') {
      icon = '&#x2728;';
      desc = '创建了 ' + (e.payload.ref_type || '') + ' ' + (e.payload.ref || '');
    } else if (e.type === 'WatchEvent') {
      icon = '&#x2B50;';
      desc = 'Starred';
    } else if (e.type === 'ForkEvent') {
      icon = '&#x1F374;';
      desc = 'Fork';
    } else if (e.type === 'IssuesEvent') {
      icon = '&#x1F4CB;';
      desc = e.payload.action + ' issue: ' + (e.payload.issue ? escHtml(e.payload.issue.title) : '');
    } else if (e.type === 'PullRequestEvent') {
      icon = '&#x1F500;';
      desc = e.payload.action + ' PR: ' + (e.payload.pull_request ? escHtml(e.payload.pull_request.title) : '');
    } else {
      desc = e.type.replace('Event','');
    }
    const time = new Date(e.created_at).toLocaleDateString('zh-CN');
    return `<div class="event-item">
      <div class="event-icon">${icon}</div>
      <div class="event-body">
        <div class="event-repo"><a href="https://github.com/${e.repo.name}" target="_blank" rel="noopener">${escHtml(e.repo.name)}</a></div>
        <div class="event-desc">${desc}</div>
        <div class="event-time">${time}</div>
      </div>
    </div>`;
  }).join('');
  list.innerHTML = items || '<div class="profile-loading">暂无动态</div>';
}

// ── LeetCode User Binding ──
const LEETCODE_API = '/api/leetcode';

function getLeetCodeUsername() {
  return localStorage.getItem('leetcode_username') || '';
}

function saveLeetCodeUsername(username) {
  localStorage.setItem('leetcode_username', username);
}

async function bindLeetCode() {
  const input = document.getElementById('leetcode-username-input');
  const btn = document.getElementById('leetcode-bind-btn');
  const form = document.getElementById('leetcode-bind-form');
  const profile = document.getElementById('leetcode-profile');
  const errorEl = document.getElementById('leetcode-error');

  let username = input.value.trim();

  // If in change mode, get from input; otherwise use saved
  if (!username && profile.classList.contains('hidden')) {
    username = getLeetCodeUsername();
  }

  if (!username) {
    showLeetCodeError('请输入 LeetCode 用户名');
    return;
  }

  // Validate username format (basic validation)
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    showLeetCodeError('用户名格式不正确（只允许字母、数字、下划线、连字符）');
    return;
  }

  // Show loading state
  btn.textContent = '验证中...';
  btn.disabled = true;
  errorEl.classList.add('hidden');

  try {
    const response = await fetch(`${LEETCODE_API}/${encodeURIComponent(username)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '验证失败，用户不存在');
    }

    // Success - save and display
    saveLeetCodeUsername(username);
    displayLeetCodeProfile(data);

    // Hide form, show profile
    form.classList.add('hidden');
    profile.classList.remove('hidden');

  } catch (e) {
    showLeetCodeError(e.message || '验证失败，请检查用户名是否正确');
  } finally {
    btn.textContent = '绑定';
    btn.disabled = false;
  }
}

function displayLeetCodeProfile(data) {
  const avatar = document.getElementById('leetcode-avatar');
  const name = document.getElementById('leetcode-name');
  const ranking = document.getElementById('leetcode-ranking');
  const total = document.getElementById('leetcode-total');
  const easy = document.getElementById('leetcode-easy');
  const medium = document.getElementById('leetcode-medium');
  const hard = document.getElementById('leetcode-hard');

  // Set avatar
  if (data.avatar) {
    avatar.src = data.avatar;
  } else {
    avatar.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect fill="%23333" width="96" height="96"/><text x="48" y="60" font-size="48" text-anchor="middle" fill="%23666">?</text></svg>';
  }

  name.textContent = data.username || '—';
  ranking.textContent = data.ranking ? `全球排名: #${data.ranking.toLocaleString()}` : '全球排名: —';
  total.textContent = data.totalSolved || 0;
  easy.textContent = data.easySolved || 0;
  medium.textContent = data.mediumSolved || 0;
  hard.textContent = data.hardSolved || 0;
}

function showLeetCodeError(message) {
  const errorEl = document.getElementById('leetcode-error');
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
}

function changeLeetCode() {
  const form = document.getElementById('leetcode-bind-form');
  const profile = document.getElementById('leetcode-profile');
  const input = document.getElementById('leetcode-username-input');
  const errorEl = document.getElementById('leetcode-error');

  // Populate input with current username
  input.value = getLeetCodeUsername();
  errorEl.classList.add('hidden');

  // Toggle visibility
  form.classList.remove('hidden');
  profile.classList.add('hidden');
}

function loadLeetCodeProfile() {
  const username = getLeetCodeUsername();
  if (!username) {
    // Show form, hide profile
    document.getElementById('leetcode-bind-form').classList.remove('hidden');
    document.getElementById('leetcode-profile').classList.add('hidden');
    return;
  }

  // Fetch profile from API
  fetch(`${LEETCODE_API}/${encodeURIComponent(username)}`)
    .then(r => r.json())
    .then(data => {
      if (data.error) {
        // Show form with saved username for retry
        document.getElementById('leetcode-bind-form').classList.remove('hidden');
        document.getElementById('leetcode-profile').classList.add('hidden');
        document.getElementById('leetcode-username-input').value = username;
        return;
      }
      displayLeetCodeProfile(data);
      document.getElementById('leetcode-bind-form').classList.add('hidden');
      document.getElementById('leetcode-profile').classList.remove('hidden');
    })
    .catch(() => {
      // Show form with saved username for retry
      document.getElementById('leetcode-bind-form').classList.remove('hidden');
      document.getElementById('leetcode-profile').classList.add('hidden');
      document.getElementById('leetcode-username-input').value = username;
    });
}

// Handle Enter key in input
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('leetcode-username-input');
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        bindLeetCode();
      }
    });
  }
});
