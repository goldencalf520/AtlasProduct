/* ==================================================================
   产品管理器 · 共享脚本
   ================================================================== */

const ICONS = {
  logo: '<path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z"/><path d="M12 12l8-4.5M12 12v9M12 12 4 7.5"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>',
  github: '<path d="M9 19c-4 1.5-4-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
  star: '<path d="m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9L12 3Z"/>',
  fork: '<circle cx="6" cy="5" r="2.5"/><circle cx="18" cy="5" r="2.5"/><circle cx="12" cy="19" r="2.5"/><path d="M6 7.5v2a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-2M12 12.5v4"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/>',
  trash: '<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6M10 11v6M14 11v6"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowLeft: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
  arrowUpRight: '<path d="M7 17 17 7M9 7h8v8"/>',
  link: '<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5"/>',
  lock: '<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  code: '<path d="m16 18 5-6-5-6M8 6l-5 6 5 6"/>',
  sparkles: '<path d="M12 3v3M12 18v3M4.2 7.2l2.1 2.1M17.7 14.7l2.1 2.1M3 12h3M18 12h3M4.2 16.8l2.1-2.1M17.7 9.3l2.1-2.1"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  download: '<path d="M12 3v12M7 11l5 5 5-5M4 21h16"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  box: '<path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="m3 8 9 5 9-5M12 21v-8"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  filter: '<path d="M4 5h16l-6 7v6l-4 2v-8L4 5Z"/>',
  rocket: '<path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2c.9-.9.9-2.4 0-3.3a2.3 2.3 0 0 0-3 .3Z"/><path d="M14.5 4.5C17 2 21 2 21 2s0 4-2.5 6.5L13 14l-3-3 4.5-6.5Z"/><path d="M9 11H5l2-4h4M13 15v4l4-2v-4"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>',
};

function icon(name, cls = '') {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="${cls}" aria-hidden="true">${ICONS[name] || ''}</svg>`;
}

/* ---------------- 工具 ---------------- */
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function fmtNum(n) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  if (n >= 10000) return (n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, '') + 'k';
  if (n >= 1000) return n.toLocaleString('en-US');
  return String(n);
}

function timeAgo(iso) {
  if (!iso) return '—';
  const t = new Date(iso).getTime();
  if (isNaN(t)) return '—';
  const d = Date.now() - t;
  const m = Math.floor(d / 60000);
  if (m < 1) return '刚刚';
  if (m < 60) return m + ' 分钟前';
  const h = Math.floor(m / 60);
  if (h < 24) return h + ' 小时前';
  const day = Math.floor(h / 24);
  if (day < 30) return day + ' 天前';
  const mo = Math.floor(day / 30);
  if (mo < 12) return mo + ' 个月前';
  return new Date(iso).toLocaleDateString('zh-CN');
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d) ? '—' : d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

const STATUS_MAP = {
  live: { label: '已上线', cls: 'status-live' },
  beta: { label: '内测中', cls: 'status-beta' },
  building: { label: '开发中', cls: 'status-building' },
  archived: { label: '已归档', cls: 'status-archived' },
};

const PALETTE = [
  ['#3d2f7a', '#7c5cff'],
  ['#1f4d5c', '#4fd1c5'],
  ['#6b2f4a', '#ff7a9c'],
  ['#4a3a1a', '#ffb86b'],
  ['#2c3a6b', '#6a8cff'],
  ['#4a2a6b', '#b06bff'],
  ['#1f4a3a', '#3ddc97'],
  ['#5a2f2f', '#ff8a6b'],
];

const CAT_COLORS = {
  协作工具: ['#3d2f7a', '#7c5cff'],
  设计工具: ['#6b2f4a', '#ff7a9c'],
  开发者工具: ['#1f4d5c', '#4fd1c5'],
  效率办公: ['#4a3a1a', '#ffb86b'],
  设计系统: ['#2c3a6b', '#6a8cff'],
  'AI 应用': ['#4a2a6b', '#b06bff'],
  后端服务: ['#1f4a3a', '#3ddc97'],
};

function catColors(cat) {
  if (CAT_COLORS[cat]) return CAT_COLORS[cat];
  let h = 0;
  for (const ch of String(cat || '')) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return PALETTE[h % PALETTE.length];
}

function monogram(name) {
  const s = String(name || '?').trim();
  if (!s) return '?';
  const m = s.match(/[A-Za-z0-9]/);
  return (m ? m[0] : s[0]).toUpperCase();
}

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/* ---------------- 本地设置 ---------------- */
const Settings = {
  get token() {
    try { return localStorage.getItem('pl_gh_token') || ''; } catch { return ''; }
  },
  set token(v) {
    try { v ? localStorage.setItem('pl_gh_token', v) : localStorage.removeItem('pl_gh_token'); } catch {}
  },
  get view() {
    try { return localStorage.getItem('pl_view') || 'grid'; } catch { return 'grid'; }
  },
  set view(v) {
    try { localStorage.setItem('pl_view', v); } catch {}
  },
};

/* ---------------- API ---------------- */
async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { 'content-type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `请求失败 (${res.status})`);
  return data;
}

const API = {
  list: (params = {}) => api('/api/products?' + new URLSearchParams(params)),
  get: (id) => api('/api/products/' + encodeURIComponent(id)),
  create: (body) => api('/api/products', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => api('/api/products/' + encodeURIComponent(id), { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id) => api('/api/products/' + encodeURIComponent(id), { method: 'DELETE' }),
  meta: (url) => api('/api/meta?url=' + encodeURIComponent(url)),
  github: (repo) =>
    api('/api/github?repo=' + encodeURIComponent(repo), {
      headers: Settings.token ? { 'x-github-token': Settings.token } : {},
    }),
  stats: () => api('/api/stats'),
  health: () => api('/api/health'),
};

/* ---------------- Toast ---------------- */
function toast(msg, type = 'ok') {
  let stack = document.querySelector('.toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = `${icon(type === 'ok' ? 'check' : 'alert')}<span>${esc(msg)}</span>`;
  stack.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 260);
  }, 2800);
}

/* ---------------- 卡片 / 行 / 表格渲染 ---------------- */
function coverStyle(p) {
  const [c1, c2] = catColors(p.category);
  if (p.cover) {
    return `--c1:${c1};--c2:${c2};background-color:${c1};background-image:linear-gradient(180deg,rgba(8,8,12,.15),rgba(8,8,12,.55)),url('${esc(p.cover)}');background-size:cover;background-position:center;`;
  }
  return `--c1:${c1};--c2:${c2};`;
}

function iconHTML(p) {
  const fb = esc(monogram(p.name));
  if (!p.icon) return fb;
  const src = /^https?:/i.test(p.icon) ? '/api/icon?url=' + encodeURIComponent(p.icon) : p.icon;
  return `${fb}<img src="${esc(src)}" alt="" loading="lazy" onerror="this.remove()">`;
}

function cardHTML(p, i = 0) {
  const st = STATUS_MAP[p.status] || STATUS_MAP.live;
  const tags = (p.tags || []).slice(0, 2).map((t) => `<span class="tag">${esc(t)}</span>`).join('');
  return `
  <article class="p-card" data-id="${p.id}" style="--d:${Math.min(i * 40, 320)}ms">
    <div class="p-cover ${p.cover ? 'has-img' : ''}" style="${coverStyle(p)}">
      <span class="p-mono">${esc(monogram(p.name))}</span>
      ${p.featured ? `<span class="p-badge star">${icon('star')}精选</span>` : `<span class="p-badge">${esc(p.category || '未分类')}</span>`}
      <div class="p-actions">
        <button class="btn-icon" data-act="open" title="打开线上站点">${icon('external')}</button>
        <button class="btn-icon" data-act="edit" title="编辑">${icon('edit')}</button>
      </div>
    </div>
    <div class="p-body">
      <div class="p-head">
        <span class="p-icon">${iconHTML(p)}</span>
        <span class="p-name">${esc(p.name)}</span>
        <span class="status ${st.cls}">${st.label}</span>
      </div>
      <p class="p-desc">${esc(p.tagline || p.description || '暂无简介')}</p>
      <div class="p-tags">${tags}</div>
      <div class="p-foot">
        <span class="m">${icon('star')}${fmtNum(p.stars)}</span>
        <span class="m">${icon('clock')}${timeAgo(p.updatedAt)}</span>
        <span class="sep"></span>
        ${p.repoUrl ? `<span class="m">${icon('github')}${p.isPrivate ? '私有' : '源码'}</span>` : ''}
      </div>
    </div>
  </article>`;
}

function rowHTML(p, i = 0) {
  const st = STATUS_MAP[p.status] || STATUS_MAP.live;
  return `
  <div class="p-row" data-id="${p.id}" style="--d:${Math.min(i * 25, 250)}ms">
    <span class="p-icon">${iconHTML(p)}</span>
    <div class="p-row-main">
      <div class="p-row-title">${esc(p.name)}<span class="tag tag-brand">${esc(p.category || '未分类')}</span></div>
      <div class="p-row-desc">${esc(p.tagline || p.description || '暂无简介')}</div>
    </div>
    <div class="p-row-tags">${(p.tags || []).slice(0, 3).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
    <div class="p-row-meta">
      <span class="status ${st.cls}">${st.label}</span>
      <span>★ ${fmtNum(p.stars)}</span>
      <span>${timeAgo(p.updatedAt)}</span>
    </div>
    <div class="p-row-actions">
      <button class="btn-icon" data-act="open" title="打开">${icon('external')}</button>
      <button class="btn-icon" data-act="edit" title="编辑">${icon('edit')}</button>
    </div>
  </div>`;
}

function tableHTML(list) {
  return `
  <div class="table-wrap">
    <table class="ptable">
      <thead><tr>
        <th style="width:26%">产品</th><th>简介</th><th>分类</th><th>状态</th>
        <th>Star</th><th>技术栈</th><th>更新</th><th style="text-align:right">操作</th>
      </tr></thead>
      <tbody>
        ${list.map((p) => {
          const st = STATUS_MAP[p.status] || STATUS_MAP.live;
          return `<tr data-id="${p.id}">
            <td><div class="t-name"><span class="p-icon">${iconHTML(p)}</span>${esc(p.name)}</div></td>
            <td><div class="t-tagline">${esc(p.tagline || p.description || '—')}</div></td>
            <td><span class="tag">${esc(p.category || '未分类')}</span></td>
            <td><span class="status ${st.cls}">${st.label}</span></td>
            <td class="num">${fmtNum(p.stars)}</td>
            <td class="num">${esc((p.tech || []).slice(0, 2).join(' · ') || '—')}</td>
            <td class="num">${timeAgo(p.updatedAt)}</td>
            <td class="t-actions">
              <button class="btn-icon" data-act="open" title="打开">${icon('external')}</button>
              <button class="btn-icon" data-act="edit" title="编辑">${icon('edit')}</button>
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>`;
}

function emptyHTML(title = '这里还空着', desc = '把第一个作品放进来吧——粘贴部署链接，剩下的交给自动抓取。', cta = true) {
  return `<div class="empty">
    <div class="empty-icon">${icon('box')}</div>
    <h3>${esc(title)}</h3>
    <p>${esc(desc)}</p>
    ${cta ? `<button class="btn btn-primary" data-act="add">${icon('plus')}添加产品</button>` : ''}
  </div>`;
}

/* 滚动入场 */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach((e) => e.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  els.forEach((e) => io.observe(e));
}
