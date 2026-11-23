/**
 * 产品管理器 · Product Library
 * Express 服务：产品 CRUD + 链接元信息抓取 + GitHub 仓库代理
 */
const express = require('express');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const os = require('os');
const net = require('net');
const dns = require('dns').promises;
const crypto = require('crypto');

const app = express();
app.disable('x-powered-by');
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const BUNDLED_DATA_FILE = path.join(ROOT, 'data', 'products.json');

/* 存储位置在启动时探测：本地写项目 data/，只读运行环境退化到临时目录 */
let DATA_DIR = '';
let DATA_FILE = '';
let storageMode = 'file';

app.use(express.json({ limit: '1mb' }));

/* 页面与脚本不缓存，避免部署后浏览器仍使用旧版本；并附加基础安全响应头 */
app.use((req, res, next) => {
  res.setHeader('x-content-type-options', 'nosniff');
  res.setHeader('referrer-policy', 'strict-origin-when-cross-origin');
  if (req.path === '/' || /\.(?:html|js|css)$/i.test(req.path)) {
    res.setHeader('cache-control', 'no-store');
  }
  next();
});

app.use(express.static(PUBLIC_DIR, { extensions: ['html'] }));

/* ------------------------------------------------------------------ */
/* 存储层：单文件 JSON，串行写入避免并发覆盖                            */
/* ------------------------------------------------------------------ */
let store = { products: [] };
let writeChain = Promise.resolve();

function seedData() {
  const now = Date.now();
  const day = 86400000;
  const mk = (i, o) => ({
    id: 'p_' + crypto.randomBytes(6).toString('hex'),
    name: o.name,
    tagline: o.tagline,
    description: o.description || '',
    demoUrl: o.demoUrl,
    repoUrl: o.repoUrl || '',
    isPrivate: !!o.isPrivate,
    category: o.category,
    tags: o.tags || [],
    tech: o.tech || [],
    status: o.status || 'live',
    cover: '',
    icon: '',
    featured: !!o.featured,
    notes: o.notes || '',
    stars: null,
    forks: null,
    language: o.tech?.[0] || '',
    repoPushedAt: '',
    createdAt: new Date(now - (12 - i) * day).toISOString(),
    updatedAt: new Date(now - i * day).toISOString(),
  });

  return [
    mk(0, {
      name: 'Excalidraw',
      tagline: '手绘风格的协作白板，随手画出架构图',
      description:
        '开源虚拟白板，支持多人实时协作、手绘风格图形与端到端加密分享。常被用于画系统架构图、流程草图与产品原型。',
      demoUrl: 'https://excalidraw.com',
      repoUrl: 'https://github.com/excalidraw/excalidraw',
      category: '协作工具',
      tags: ['白板', '实时协作', '开源'],
      tech: ['TypeScript', 'React', 'Canvas'],
      status: 'live',
      featured: true,
      notes: '支持导出 PNG / SVG，也可嵌入到自己的产品里。',
    }),
    mk(1, {
      name: 'tldraw',
      tagline: '可嵌入的无限画布 SDK',
      description:
        '面向开发者的无限画布引擎，提供开箱即用的绘图、便签、图片与协同能力，可作为 SDK 集成进任意 Web 应用。',
      demoUrl: 'https://tldraw.com',
      repoUrl: 'https://github.com/tldraw/tldraw',
      category: '设计工具',
      tags: ['画布', 'SDK', '开源'],
      tech: ['TypeScript', 'React'],
      status: 'live',
      featured: true,
    }),
    mk(2, {
      name: 'Hoppscotch',
      tagline: '打开即用的 API 调试工具',
      description:
        '轻量级 API 开发套件，支持 REST / GraphQL / WebSocket / SSE 调试，无需安装客户端，浏览器打开即可发请求。',
      demoUrl: 'https://hoppscotch.io',
      repoUrl: 'https://github.com/hoppscotch/hoppscotch',
      category: '开发者工具',
      tags: ['API', '调试', '开源'],
      tech: ['Vue', 'TypeScript', 'PWA'],
      status: 'live',
    }),
    mk(3, {
      name: 'Cal.com',
      tagline: '开源的日程预约基础设施',
      description:
        '可自托管的日程调度平台，支持团队轮询、多时区、日历同步与嵌入组件，常被当作 Calendly 的开源替代。',
      demoUrl: 'https://cal.com',
      repoUrl: 'https://github.com/calcom/cal.com',
      category: '效率办公',
      tags: ['日程', 'SaaS', '可自托管'],
      tech: ['Next.js', 'Prisma', 'PostgreSQL'],
      status: 'live',
    }),
    mk(4, {
      name: 'shadcn/ui',
      tagline: '复制粘贴即用的组件集合',
      description:
        '不是组件库，而是可复制的组件源码集合。基于 Radix UI 与 Tailwind CSS，样式与行为完全掌握在使用者手里。',
      demoUrl: 'https://ui.shadcn.com',
      repoUrl: 'https://github.com/shadcn-ui/ui',
      category: '设计系统',
      tags: ['组件', 'Tailwind', '设计'],
      tech: ['React', 'Tailwind CSS', 'Radix'],
      status: 'live',
      featured: true,
    }),
    mk(5, {
      name: 'Open WebUI',
      tagline: '自托管的 AI 对话工作台',
      description:
        '可完全离线运行的 LLM 交互界面，兼容 Ollama 与 OpenAI API，支持知识库、模型切换、多用户与插件扩展。',
      demoUrl: 'https://openwebui.com',
      repoUrl: 'https://github.com/open-webui/open-webui',
      category: 'AI 应用',
      tags: ['LLM', '自托管', 'RAG'],
      tech: ['Python', 'Svelte', 'FastAPI'],
      status: 'beta',
      notes: '本地部署需先启动 Ollama，默认端口 3000。',
    }),
    mk(6, {
      name: 'Supabase',
      tagline: '开源的 Firebase 替代方案',
      description:
        '基于 PostgreSQL 的后端即服务，提供数据库、认证、存储、实时订阅与边缘函数，控制台体验相当完整。',
      demoUrl: 'https://supabase.com',
      repoUrl: 'https://github.com/supabase/supabase',
      category: '后端服务',
      tags: ['PostgreSQL', 'BaaS', '开源'],
      tech: ['TypeScript', 'Go', 'PostgreSQL'],
      status: 'live',
    }),
  ];
}

/* 探测可写目录：本地用项目 data/，容器等只读运行环境退化到 TMPDIR */
async function resolveStorage() {
  const candidates = [
    process.env.DATA_DIR,
    path.join(ROOT, 'data'),
    path.join(os.tmpdir(), 'atlas-product-library'),
  ].filter(Boolean);

  for (const dir of candidates) {
    try {
      await fsp.mkdir(dir, { recursive: true });
      const probe = path.join(dir, '.write-probe');
      await fsp.writeFile(probe, 'ok');
      await fsp.rm(probe, { force: true });
      DATA_DIR = dir;
      DATA_FILE = path.join(dir, 'products.json');
      storageMode = path.resolve(dir).startsWith(path.resolve(ROOT)) ? 'file' : 'temp';
      return;
    } catch {}
  }
  throw new Error('没有可写的数据目录');
}

async function initStore() {
  await resolveStorage();
  try {
    const raw = await fsp.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    store.products = Array.isArray(parsed.products) ? parsed.products : [];
  } catch {
    store.products = (await readSeedData()) || seedData();
    await persist();
  }
}

/* 只读运行环境下优先复用随包分发的示例数据 */
async function readSeedData() {
  try {
    const parsed = JSON.parse(await fsp.readFile(BUNDLED_DATA_FILE, 'utf8'));
    return Array.isArray(parsed.products) && parsed.products.length ? parsed.products : null;
  } catch {
    return null;
  }
}

function persist() {
  writeChain = writeChain.then(async () => {
    const tmp = DATA_FILE + '.tmp';
    await fsp.writeFile(tmp, JSON.stringify(store, null, 2), 'utf8');
    await fsp.rename(tmp, DATA_FILE);
  }).catch((e) => console.error('[persist]', e.message));
  return writeChain;
}

/* ------------------------------------------------------------------ */
/* 工具函数                                                           */
/* ------------------------------------------------------------------ */
const STATUSES = ['live', 'beta', 'building', 'archived'];

function cleanUrl(input) {
  if (!input) return '';
  let u = String(input).trim();
  if (!u) return '';
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  try {
    const url = new URL(u);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    return url.toString();
  } catch {
    return '';
  }
}

function parseRepo(input) {
  if (!input) return null;
  const raw = String(input).trim();
  const m = raw.match(/github\.com[/:]([^/\s]+)\/([^/\s?#]+)/i);
  if (m) return { owner: m[1], repo: m[2].replace(/\.git$/i, '') };
  const m2 = raw.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (m2) return { owner: m2[1], repo: m2[2].replace(/\.git$/i, '') };
  return null;
}

function decodeEntities(s = '') {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)));
}

function parseMetaTags(html) {
  const map = {};
  const tagRe = /<meta\b[^>]*>/gi;
  let m;
  while ((m = tagRe.exec(html))) {
    const tag = m[0];
    const key =
      (tag.match(/(?:property|name)\s*=\s*["']([^"']+)["']/i) || [])[1] || '';
    const content =
      (tag.match(/content\s*=\s*["']([\s\S]*?)["']/i) || [])[1] || '';
    if (key && content && !map[key.toLowerCase()]) {
      map[key.toLowerCase()] = decodeEntities(content).trim();
    }
  }
  return map;
}

/* 缓存：避免频繁请求外部站点 */
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000;
function cacheGet(key) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.t < CACHE_TTL) return hit.v;
  cache.delete(key);
  return null;
}
function cacheSet(key, v) {
  if (cache.size > 300) cache.clear();
  cache.set(key, { t: Date.now(), v });
  return v;
}

/* 对外抓取只允许公网 http/https，避免被当作内网探测代理 */
function isPrivateAddress(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return (
      a === 0 || a === 10 || a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    );
  }
  if (net.isIPv6(ip)) {
    const s = ip.toLowerCase();
    if (s === '::1' || s === '::') return true;
    const mapped = s.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateAddress(mapped[1]);
    return s.startsWith('fc') || s.startsWith('fd') || /^fe[89ab]/.test(s);
  }
  return false;
}

async function assertSafeTarget(rawUrl) {
  const u = new URL(rawUrl);
  if (!['http:', 'https:'].includes(u.protocol)) throw new Error('仅支持 http / https 链接');
  const host = u.hostname.replace(/^\[|\]$/g, '');
  if (/^(localhost|.*\.localhost|.*\.local|.*\.internal)$/i.test(host)) {
    throw new Error('该地址不允许从服务端访问');
  }
  if (net.isIP(host)) {
    if (isPrivateAddress(host)) throw new Error('该地址不允许从服务端访问');
    return u;
  }
  const addrs = await dns.lookup(host, { all: true, verbatim: true });
  if (!addrs.length || addrs.some((a) => isPrivateAddress(a.address))) {
    throw new Error('该地址不允许从服务端访问');
  }
  return u;
}

/* 手动跟随重定向，保证每一跳都经过公网校验 */
async function safeFetch(rawUrl, options = {}, maxHops = 4) {
  let current = new URL(rawUrl).toString();
  for (let hop = 0; hop <= maxHops; hop++) {
    await assertSafeTarget(current);
    const res = await fetch(current, { ...options, redirect: 'manual' });
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const loc = res.headers.get('location');
      if (!loc) return { res, finalUrl: current };
      current = new URL(loc, current).toString();
      continue;
    }
    return { res, finalUrl: current };
  }
  throw new Error('目标地址重定向次数过多');
}

async function fetchMeta(rawUrl) {
  const url = cleanUrl(rawUrl);
  if (!url) throw new Error('链接格式不正确');
  const cached = cacheGet('meta:' + url);
  if (cached) return cached;

  const { res, finalUrl } = await safeFetch(url, {
    signal: AbortSignal.timeout(9000),
    headers: {
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
      accept: 'text/html,application/xhtml+xml',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
    },
  });
  if (!res.ok) throw new Error('目标站点返回 ' + res.status);

  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('html')) throw new Error('目标地址不是网页');

  const html = (await res.text()).slice(0, 400000);
  const meta = parseMetaTags(html);
  const origin = new URL(finalUrl).origin;

  const title =
    meta['og:title'] || meta['twitter:title'] || decodeEntities((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '').trim();
  const description =
    meta['og:description'] || meta['twitter:description'] || meta.description || '';

  let icon = '';
  let iconHref =
    (html.match(/<link\b[^>]*rel\s*=\s*["'][^"']*icon[^"']*["'][^>]*>/i) || [])[0] || '';
  const hrefMatch = iconHref.match(/href\s*=\s*["']([^"']+)["']/i);
  if (hrefMatch) {
    try {
      icon = new URL(decodeEntities(hrefMatch[1]), finalUrl).toString();
    } catch {}
  }
  if (!icon) icon = origin + '/favicon.ico';

  const out = {
    url,
    finalUrl,
    siteName: meta['og:site_name'] || new URL(finalUrl).hostname.replace(/^www\./, ''),
    title: title.slice(0, 160),
    description: description.slice(0, 400),
    icon,
    image: meta['og:image'] || meta['twitter:image'] || '',
    themeColor: meta['theme-color'] || '',
  };
  return cacheSet('meta:' + url, out);
}

async function fetchGithub(repoInput, token) {
  const repo = parseRepo(repoInput);
  if (!repo) throw new Error('无法识别 GitHub 仓库地址');
  const key = `gh:${repo.owner}/${repo.repo}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  const headers = {
    accept: 'application/vnd.github+json',
    'user-agent': 'product-library',
  };
  if (token) headers.authorization = 'Bearer ' + token;

  const res = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}`, {
    headers,
    signal: AbortSignal.timeout(9000),
  });

  if (res.status === 404) {
    const err = new Error(
      token
        ? '仓库不存在，或该 Token 没有访问权限'
        : '仓库不存在，或这是一个私有仓库（请在设置中配置 GitHub Token）'
    );
    err.code = 'NOT_FOUND';
    throw err;
  }
  if (res.status === 403 || res.status === 429) {
    const err = new Error('GitHub API 触发限流，请稍后再试或配置 Token');
    err.code = 'RATE_LIMIT';
    throw err;
  }
  if (!res.ok) throw new Error('GitHub 接口异常 ' + res.status);

  const d = await res.json();
  const out = {
    fullName: d.full_name,
    name: d.name,
    owner: d.owner?.login,
    avatar: d.owner?.avatar_url,
    description: d.description || '',
    stars: d.stargazers_count,
    forks: d.forks_count,
    issues: d.open_issues_count,
    language: d.language || '',
    topics: d.topics || [],
    homepage: d.homepage || '',
    isPrivate: !!d.private,
    pushedAt: d.pushed_at,
    createdAt: d.created_at,
    license: d.license?.spdx_id || '',
    htmlUrl: d.html_url,
  };
  return cacheSet(key, out);
}

/* ------------------------------------------------------------------ */
/* API                                                               */
/* ------------------------------------------------------------------ */
app.get('/api/products', (req, res) => {
  const { q = '', category = '', tag = '', status = '', featured = '', sort = 'updated' } = req.query;
  let list = [...store.products];

  if (featured === '1') list = list.filter((p) => p.featured);

  if (q) {
    const kw = String(q).toLowerCase();
    list = list.filter((p) =>
      [p.name, p.tagline, p.description, p.category, ...(p.tags || []), ...(p.tech || [])]
        .join(' ')
        .toLowerCase()
        .includes(kw)
    );
  }
  if (category) list = list.filter((p) => p.category === category);
  if (tag) list = list.filter((p) => (p.tags || []).includes(tag));
  if (status) list = list.filter((p) => p.status === status);

  const sorters = {
    updated: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
    created: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    name: (a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'),
    stars: (a, b) => (b.stars || 0) - (a.stars || 0),
  };
  list.sort(sorters[sort] || sorters.updated);

  res.json({ products: list, total: store.products.length, stats: buildStats() });
});

app.get('/api/products/:id', (req, res) => {
  const p = store.products.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: '产品不存在' });
  res.json(p);
});

function sanitize(body, base = {}) {
  const out = { ...base };
  const str = (v, n) => String(v ?? '').trim().slice(0, n);
  const arr = (v) =>
    (Array.isArray(v) ? v : String(v || '').split(/[,，\s]+/))
      .map((s) => String(s).trim())
      .filter(Boolean)
      .slice(0, 12);

  if (body.name !== undefined) out.name = str(body.name, 60);
  if (body.tagline !== undefined) out.tagline = str(body.tagline, 120);
  if (body.description !== undefined) out.description = str(body.description, 2000);
  if (body.demoUrl !== undefined) out.demoUrl = cleanUrl(body.demoUrl);
  if (body.repoUrl !== undefined) out.repoUrl = str(body.repoUrl, 300);
  if (body.isPrivate !== undefined) out.isPrivate = !!body.isPrivate;
  if (body.category !== undefined) out.category = str(body.category, 30) || '未分类';
  if (body.tags !== undefined) out.tags = arr(body.tags);
  if (body.tech !== undefined) out.tech = arr(body.tech);
  if (body.status !== undefined) out.status = STATUSES.includes(body.status) ? body.status : 'live';
  if (body.cover !== undefined) out.cover = str(body.cover, 500);
  if (body.icon !== undefined) out.icon = str(body.icon, 500);
  if (body.notes !== undefined) out.notes = str(body.notes, 2000);
  if (body.featured !== undefined) out.featured = !!body.featured;
  if (body.stars !== undefined) out.stars = body.stars === null || body.stars === '' ? null : Number(body.stars) || 0;
  if (body.forks !== undefined) out.forks = body.forks === null || body.forks === '' ? null : Number(body.forks) || 0;
  if (body.language !== undefined) out.language = str(body.language, 30);
  if (body.repoPushedAt !== undefined) out.repoPushedAt = str(body.repoPushedAt, 40);
  return out;
}

/* 保存时自动补齐仓库数据，省掉手动点「同步」 */
async function hydrateRepo(product, previousRepoUrl = '') {
  if (!product.repoUrl) return product;
  const changed = product.repoUrl !== previousRepoUrl;
  const missing = product.stars === null || product.stars === undefined;
  if (!changed && !missing) return product;
  try {
    const d = await fetchGithub(product.repoUrl, process.env.GITHUB_TOKEN || '');
    product.stars = d.stars ?? product.stars;
    product.forks = d.forks ?? product.forks;
    product.language = product.language || d.language || '';
    product.repoPushedAt = d.pushedAt || product.repoPushedAt || '';
    if (!product.tagline && d.description) product.tagline = String(d.description).slice(0, 120);
    if (!product.tags?.length && d.topics?.length) product.tags = d.topics.slice(0, 4);
    if (!product.tech?.length && d.language) product.tech = [d.language];
  } catch {}
  return product;
}

app.post('/api/products', async (req, res) => {
  const data = sanitize(req.body, {});
  if (!data.name) return res.status(400).json({ error: '请填写产品名称' });
  if (!data.demoUrl) return res.status(400).json({ error: '请填写可访问的部署链接' });

  const now = new Date().toISOString();
  const product = {
    id: 'p_' + crypto.randomBytes(6).toString('hex'),
    name: data.name,
    tagline: data.tagline || '',
    description: data.description || '',
    demoUrl: data.demoUrl,
    repoUrl: data.repoUrl || '',
    isPrivate: !!data.isPrivate,
    category: data.category || '未分类',
    tags: data.tags || [],
    tech: data.tech || [],
    status: data.status || 'live',
    cover: data.cover || '',
    icon: data.icon || '',
    featured: !!data.featured,
    notes: data.notes || '',
    stars: data.stars ?? null,
    forks: data.forks ?? null,
    language: data.language || '',
    repoPushedAt: data.repoPushedAt || '',
    createdAt: now,
    updatedAt: now,
  };
  store.products.unshift(product);
  await hydrateRepo(product);
  await persist();
  res.status(201).json(product);
});

app.patch('/api/products/:id', async (req, res) => {
  const idx = store.products.findIndex((x) => x.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: '产品不存在' });
  const prev = store.products[idx];
  const data = sanitize(req.body, prev);
  if (!data.name) return res.status(400).json({ error: '请填写产品名称' });
  const next = { ...data, updatedAt: new Date().toISOString() };
  await hydrateRepo(next, prev.repoUrl);
  store.products[idx] = next;
  await persist();
  res.json(store.products[idx]);
});

app.delete('/api/products/:id', async (req, res) => {
  const idx = store.products.findIndex((x) => x.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: '产品不存在' });
  const [removed] = store.products.splice(idx, 1);
  await persist();
  res.json({ ok: true, id: removed.id });
});

app.get('/api/stats', (req, res) => res.json(buildStats()));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    status: 'ready',
    products: store.products.length,
    uptime: Math.round(process.uptime()),
    storage: storageMode,
    ephemeral: storageMode === 'temp',
    node: process.version,
  });
});

function buildStats() {
  const list = store.products;
  const catMap = {};
  const techSet = new Set();
  let stars = 0;
  list.forEach((p) => {
    catMap[p.category || '未分类'] = (catMap[p.category || '未分类'] || 0) + 1;
    (p.tech || []).forEach((t) => techSet.add(t));
    stars += p.stars || 0;
  });
  return {
    total: list.length,
    live: list.filter((p) => p.status === 'live').length,
    featured: list.filter((p) => p.featured).length,
    categories: Object.entries(catMap).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count })),
    techCount: techSet.size,
    stars,
    tags: [...new Set(list.flatMap((p) => p.tags || []))].slice(0, 40),
  };
}

app.get('/api/meta', async (req, res) => {
  try {
    const data = await fetchMeta(req.query.url);
    res.json(data);
  } catch (e) {
    res.status(422).json({ error: e.message || '抓取失败' });
  }
});

/* 站点图标代理：避免外链被墙 / 防盗链，同源加载并缓存 */
const iconCache = new Map();
app.get('/api/icon', async (req, res) => {
  const target = cleanUrl(req.query.url);
  if (!target) return res.status(400).end();

  const hit = iconCache.get(target);
  if (hit) {
    res.setHeader('content-type', hit.type);
    res.setHeader('cache-control', 'public, max-age=86400');
    res.setHeader('x-content-type-options', 'nosniff');
    res.setHeader('content-security-policy', "default-src 'none'; style-src 'unsafe-inline'");
    return res.end(hit.buf);
  }
  try {
    const { res: r } = await safeFetch(target, {
      signal: AbortSignal.timeout(6000),
      headers: {
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
        accept: 'image/avif,image/webp,image/png,image/svg+xml,image/*,*/*;q=0.8',
      },
    });
    const type = r.headers.get('content-type') || '';
    if (!r.ok || !type.startsWith('image/')) return res.status(404).end();
    if (Number(r.headers.get('content-length') || 0) > 400000) return res.status(404).end();
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > 400000) return res.status(404).end();
    if (iconCache.size > 300) iconCache.clear();
    iconCache.set(target, { type, buf });
    res.setHeader('content-type', type);
    res.setHeader('cache-control', 'public, max-age=86400');
    res.setHeader('x-content-type-options', 'nosniff');
    res.setHeader('content-security-policy', "default-src 'none'; style-src 'unsafe-inline'");
    res.end(buf);
  } catch {
    res.status(404).end();
  }
});

app.get('/api/github', async (req, res) => {
  try {
    const token = req.get('x-github-token') || process.env.GITHUB_TOKEN || '';
    const data = await fetchGithub(req.query.repo || req.query.url, token);
    res.json(data);
  } catch (e) {
    res.status(422).json({ error: e.message || 'GitHub 查询失败', code: e.code || 'ERROR' });
  }
});

app.get('/api/export', (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename="products.json"');
  res.json(store);
});

app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: '接口不存在' });
  res.status(404).sendFile(path.join(PUBLIC_DIR, '404.html'));
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: '请求数据不是有效的 JSON' });
  if (err?.type === 'entity.too.large') return res.status(413).json({ error: '提交的数据过大' });
  console.error('[error]', err?.message || err);
  res.status(500).json({ error: '服务异常，请稍后重试' });
});

/* 首次启动时补全示例仓库的 GitHub 数据（失败不影响使用） */
async function syncRepoData() {
  let changed = false;
  for (const p of store.products) {
    if (p.repoUrl && (p.stars === null || p.stars === undefined)) {
      try {
        const d = await fetchGithub(p.repoUrl, process.env.GITHUB_TOKEN || '');
        p.stars = d.stars;
        p.forks = d.forks;
        p.language = d.language || p.language;
        p.repoPushedAt = d.pushedAt || '';
        changed = true;
      } catch (e) {
        console.warn('[github]', p.name, e.message);
      }
    }
    if (!p.icon && p.demoUrl) {
      try {
        const m = await fetchMeta(p.demoUrl);
        if (m.icon) {
          p.icon = m.icon;
          changed = true;
        }
      } catch (e) {
        console.warn('[meta]', p.name, e.message);
      }
    }
  }
  if (changed) await persist();
}

initStore().then(() => {
  app.listen(PORT, HOST, () => {
    console.log(`\n  产品管理器已启动  →  http://localhost:${PORT}\n`);
    console.log(`  数据文件: ${DATA_FILE}${storageMode === 'temp' ? '（临时目录，重启后重置）' : ''}`);
    console.log(`  已收录 ${store.products.length} 个产品\n`);
    syncRepoData().then(() => console.log('  GitHub 数据同步完成\n'));
  });
}).catch((e) => {
  console.error('启动失败：', e.message);
  process.exit(1);
});
