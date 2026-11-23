/* 产品详情页 */
(function () {
  const root = document.getElementById('detail');
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  let product = null;

  const $ = (s, r = document) => r.querySelector(s);

  function notFound(msg) {
    root.innerHTML = `<div class="center-page" style="min-height:60vh">
      <div>
        <h1>404</h1>
        <p>${esc(msg || '没有找到这个产品，它可能已经被删除。')}</p>
        <a class="btn btn-primary" href="/app.html">返回产品库</a>
      </div>
    </div>`;
  }

  function statusChip(p) {
    const st = STATUS_MAP[p.status] || STATUS_MAP.live;
    return `<span class="status ${st.cls}">${st.label}</span>`;
  }

  function linkItem({ href, title, sub, kind = 'web' }) {
    return `<a class="link-item" href="${esc(href)}" target="_blank" rel="noopener">
      <span class="li-icon ${kind === 'gh' ? 'gh' : ''}">${icon(kind === 'gh' ? 'github' : 'external')}</span>
      <span class="li-text"><b>${esc(title)}</b><small>${esc(sub)}</small></span>
      <span class="li-arrow">${icon('arrowUpRight')}</span>
    </a>`;
  }

  function render(p) {
    document.title = `${p.name} · Atlas`;
    const host = hostOf(p.demoUrl);
    const st = STATUS_MAP[p.status] || STATUS_MAP.live;
    const tags = (p.tags || []).map((t) => `<a class="tag" href="/app.html?tag=${encodeURIComponent(t)}">#${esc(t)}</a>`).join('');
    const tech = (p.tech || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('');
    const hasRepo = !!p.repoUrl;
    const repoPath = hasRepo ? p.repoUrl.replace(/^https?:\/\/(www\.)?github\.com\//, '').replace(/\.git$/, '') : '';

    root.innerHTML = `
    <nav class="crumbs">
      <a href="/app.html">产品库</a>
      ${icon('arrowRight')}
      <a href="/app.html?category=${encodeURIComponent(p.category || '')}">${esc(p.category || '未分类')}</a>
      ${icon('arrowRight')}
      <span style="color:#c9c9d4">${esc(p.name)}</span>
    </nav>

    <section class="detail-hero">
      <div class="dh-top">
        <span class="dh-icon">${iconHTML(p)}</span>
        <div style="min-width:0">
          <h1 class="dh-title">${esc(p.name)} ${p.featured ? `<span class="tag tag-brand" style="vertical-align:middle;margin-left:6px">精选</span>` : ''}</h1>
          <p class="dh-tagline">${esc(p.tagline || p.description || '还没有写简介')}</p>
        </div>
        <div class="dh-actions">
          <a class="btn btn-primary" href="${esc(p.demoUrl)}" target="_blank" rel="noopener">
            ${icon('external')} 打开站点
          </a>
          ${hasRepo ? `<a class="btn" href="${esc(p.repoUrl)}" target="_blank" rel="noopener">${icon('github')} 源代码</a>` : ''}
          <a class="btn btn-icon" href="/app.html?edit=${encodeURIComponent(p.id)}" title="编辑产品">${icon('edit')}</a>
          <button class="btn btn-icon" id="btn-copy" title="复制分享链接">${icon('link')}</button>
          <button class="btn btn-icon" id="btn-del" title="删除产品">${icon('trash')}</button>
        </div>
      </div>
      <div class="dh-meta">
        <span class="status ${st.cls}">${st.label}</span>
        <a class="tag tag-brand" href="/app.html?category=${encodeURIComponent(p.category || '')}">${esc(p.category || '未分类')}</a>
        ${tags}
        ${tech}
      </div>
    </section>

    <div class="detail-grid">
      <div>
        <section class="panel">
          <div class="preview-bar">
            <div class="dots"><i></i><i></i><i></i></div>
            <div class="addr">${icon('lock')}<span>${esc(host + (new URL(p.demoUrl).pathname === '/' ? '' : new URL(p.demoUrl).pathname))}</span></div>
            <button class="btn-icon" id="btn-show-fallback" title="预览显示异常？" style="width:28px;height:28px">${icon('alert')}</button>
            <a class="btn-icon" href="${esc(p.demoUrl)}" target="_blank" rel="noopener" title="在新窗口打开" style="width:28px;height:28px">${icon('external')}</a>
          </div>
          <div class="preview-shell">
            <div class="preview-loading" id="preview-loading"><span class="spinner"></span>正在加载线上页面…</div>
            <iframe id="preview-frame" src="${esc(p.demoUrl)}" title="${esc(p.name)} 在线预览" referrerpolicy="no-referrer" loading="lazy" allow="fullscreen"></iframe>
            <div class="preview-fallback" id="preview-fallback">
              <div class="empty-icon" style="margin-bottom:4px">${icon('eye')}</div>
              <h4>这个站点不允许被嵌入预览</h4>
              <p>目标页面设置了 X-Frame-Options 或 CSP 限制，浏览器拒绝在 iframe 中显示它。直接打开新窗口即可正常访问。</p>
              <div class="url">${esc(host)}</div>
              <a class="btn btn-sm btn-primary" href="${esc(p.demoUrl)}" target="_blank" rel="noopener">${icon('external')} 在新窗口打开</a>
            </div>
          </div>
        </section>

        ${p.description ? `<section class="panel">
          <div class="panel-head">${icon('layers')} 产品描述</div>
          <div class="panel-body"><div class="prose">${esc(p.description)}</div></div>
        </section>` : ''}

        ${p.notes ? `<section class="panel">
          <div class="panel-head">${icon('edit')} 备注</div>
          <div class="panel-body"><div class="prose">${esc(p.notes)}</div></div>
        </section>` : ''}
      </div>

      <aside>
        <section class="panel">
          <div class="panel-head">${icon('link')} 链接</div>
          <div class="panel-body">
            <div class="link-list">
              ${linkItem({ href: p.demoUrl, title: '线上站点', sub: host || p.demoUrl })}
              ${hasRepo ? linkItem({ href: p.repoUrl, title: '代码仓库', sub: repoPath + (p.isPrivate ? ' · 私有' : ''), kind: 'gh' }) : ''}
            </div>
            ${!hasRepo ? `<div class="hint" style="margin-top:10px">还没有关联代码仓库，<a href="/app.html?edit=${encodeURIComponent(p.id)}" style="color:#a894ff">去补充 →</a></div>` : ''}
          </div>
        </section>

        ${hasRepo ? `<section class="panel">
          <div class="panel-head">${icon('github')} 仓库数据
            <div class="right"><button class="btn btn-sm btn-ghost" id="btn-sync" style="height:26px;padding:0 8px;font-size:11.5px">${icon('refresh')} 同步</button></div>
          </div>
          <div class="panel-body">
            <div class="gh-stats">
              <div class="gh-stat"><div class="v">${fmtNum(p.stars)}</div><div class="k">Stars</div></div>
              <div class="gh-stat"><div class="v">${fmtNum(p.forks)}</div><div class="k">Forks</div></div>
              <div class="gh-stat"><div class="v" style="font-size:14px">${esc(p.language || '—')}</div><div class="k">主要语言</div></div>
              <div class="gh-stat"><div class="v" style="font-size:14px">${p.repoPushedAt ? timeAgo(p.repoPushedAt) : '—'}</div><div class="k">最近提交</div></div>
            </div>
            ${p.isPrivate ? `<div class="private-note" style="margin-top:12px">${icon('lock')}<div>私有仓库。同步数据需要在「设置与 Token」中配置具有 <code>repo</code> 权限的个人令牌。</div></div>` : ''}
          </div>
        </section>` : ''}

        <section class="panel">
          <div class="panel-head">${icon('box')} 详情</div>
          <div class="panel-body">
            <dl class="kv">
              <dt>分类</dt><dd>${esc(p.category || '未分类')}</dd>
              <dt>状态</dt><dd>${st.label}</dd>
              <dt>技术栈</dt><dd>${(p.tech || []).join(' · ') || '—'}</dd>
              <dt>仓库</dt><dd>${hasRepo ? (p.isPrivate ? '私有仓库' : '公开仓库') : '未关联'}</dd>
              <dt>添加时间</dt><dd>${fmtDate(p.createdAt)}</dd>
              <dt>最近更新</dt><dd>${timeAgo(p.updatedAt)}</dd>
            </dl>
          </div>
        </section>
      </aside>
    </div>

    <section id="related-block" style="margin-top:34px;display:none">
      <div class="panel-head" style="padding:0 0 14px;border:0;font-size:13px">${icon('grid')} 同类产品</div>
      <div class="related" id="related"></div>
    </section>`;

    /* 预览兜底 */
    const frame = $('#preview-frame');
    const loading = $('#preview-loading');
    const fallback = $('#preview-fallback');
    let loaded = false;
    frame.addEventListener('load', () => {
      loaded = true;
      loading.classList.add('hide');
    });
    setTimeout(() => {
      if (!loaded) {
        loading.classList.add('hide');
        fallback.classList.add('show');
      }
    }, 7000);
    $('#btn-show-fallback').onclick = () => {
      loading.classList.add('hide');
      fallback.classList.toggle('show');
    };

    /* 复制链接 */
    $('#btn-copy').onclick = async () => {
      try {
        await navigator.clipboard.writeText(location.href);
        toast('分享链接已复制');
      } catch {
        toast('复制失败，请手动复制地址栏', 'err');
      }
    };

    /* 删除 */
    $('#btn-del').onclick = () => {
      $('#confirm-desc').textContent = `确定删除「${p.name}」吗？此操作无法撤销。`;
      $('#confirm-mask').classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    /* 同步仓库 */
    const syncBtn = $('#btn-sync');
    if (syncBtn) {
      syncBtn.onclick = async () => {
        syncBtn.disabled = true;
        syncBtn.innerHTML = '<span class="spinner"></span> 同步中';
        try {
          const d = await API.github(p.repoUrl);
          const updated = await API.update(p.id, {
            stars: d.stars,
            forks: d.forks,
            language: d.language || '',
            repoPushedAt: d.pushedAt || '',
            isPrivate: !!d.isPrivate,
          });
          product = updated;
          render(updated);
          toast('仓库数据已更新');
        } catch (e) {
          toast(e.message, 'err');
          syncBtn.disabled = false;
          syncBtn.innerHTML = icon('refresh') + ' 同步';
        }
      };
    }

    loadRelated(p);
  }

  async function loadRelated(p) {
    try {
      const { products } = await API.list({ category: p.category, sort: 'stars' });
      const list = products.filter((x) => x.id !== p.id).slice(0, 3);
      if (!list.length) return;
      $('#related-block').style.display = 'block';
      $('#related').innerHTML = list
        .map(
          (x) => `<a class="rel-card" href="/product.html?id=${encodeURIComponent(x.id)}">
            <div class="rc-top"><span class="p-icon">${iconHTML(x)}</span><b>${esc(x.name)}</b></div>
            <p>${esc(x.tagline || x.description || '暂无简介')}</p>
          </a>`
        )
        .join('');
    } catch {}
  }

  document.addEventListener('click', (e) => {
    const c = e.target.closest('[data-close]');
    if (c) {
      $('#confirm-mask').classList.remove('open');
      document.body.style.overflow = '';
    }
    if (e.target.id === 'confirm-mask') {
      e.target.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  document.getElementById('confirm-ok').onclick = async () => {
    try {
      await API.remove(product.id);
      toast('产品已删除');
      setTimeout(() => (location.href = '/app.html'), 420);
    } catch (e) {
      toast(e.message, 'err');
    }
  };

  document.getElementById('btn-add-top').onclick = () => (location.href = '/app.html?new=1');

  (async function init() {
    if (!id) return notFound('缺少产品 ID，请从产品库进入。');
    try {
      product = await API.get(id);
      render(product);
    } catch (e) {
      notFound(e.message);
    }
  })();
})();
