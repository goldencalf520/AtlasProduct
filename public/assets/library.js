/* 产品库主逻辑 */
(function () {
  const state = {
    view: Settings.view || 'grid',
    q: '',
    category: '',
    tag: '',
    status: '',
    featured: false,
    sort: 'updated',
  };

  let products = [];
  let stats = null;
  let formTags = [];
  let editingId = null;
  let formMeta = {}; // 抓取到的 GitHub / 站点数据
  let searchTimer = null;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const els = {
    view: $('#view'),
    bar: $('#filter-bar'),
    title: $('#page-title'),
    count: $('#count-num'),
    sub: $('#page-sub'),
    search: $('#search'),
    sort: $('#sort'),
  };

  /* ---------------- 数据加载 ---------------- */
  async function load() {
    els.view.innerHTML = `<div style="padding:60px;text-align:center;color:var(--dim);font-size:13px">
      <span class="spinner" style="display:inline-block;margin-right:8px;vertical-align:-2px"></span>加载中…</div>`;
    const params = { sort: state.sort };
    if (state.q) params.q = state.q;
    if (state.category) params.category = state.category;
    if (state.tag) params.tag = state.tag;
    if (state.status) params.status = state.status;
    if (state.featured) params.featured = '1';

    try {
      const res = await API.list(params);
      products = res.products;
      stats = res.stats;
      renderChrome();
      render();
    } catch (e) {
      els.view.innerHTML = `<div class="empty"><div class="empty-icon">${icon('alert')}</div>
        <h3>无法加载数据</h3><p>${esc(e.message)}。请确认服务已启动：<code class="mono">node server.js</code></p></div>`;
    }
  }

  /* ---------------- 侧栏与筛选 ---------------- */
  function renderChrome() {
    if (!stats) return;
    $('#c-all').textContent = stats.total;
    $('#c-featured').textContent = stats.featured;
    $('#c-live').textContent = stats.live;

    $('#sb-cats').innerHTML = stats.categories
      .map(
        (c) => `<button class="sb-item ${state.category === c.name ? 'active' : ''}" data-cat="${esc(c.name)}">
          <span style="width:8px;height:8px;border-radius:3px;flex:none;background:linear-gradient(135deg,${catColors(c.name).join(',')})"></span>
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(c.name)}</span>
          <span class="sb-count">${c.count}</span>
        </button>`
      )
      .join('');

    $('#cat-list').innerHTML = stats.categories.map((c) => `<option value="${esc(c.name)}">`).join('');

    $$('.sb-item[data-filter]').forEach((b) => {
      const f = b.dataset.filter;
      const active =
        (f === 'all' && !state.featured && !state.status && !state.category && !state.tag) ||
        (f === 'featured' && state.featured) ||
        (f === 'live' && state.status === 'live');
      b.classList.toggle('active', active);
    });
  }

  function renderFilterBar() {
    const statuses = [
      ['', '全部状态'],
      ['live', '已上线'],
      ['beta', '内测中'],
      ['building', '开发中'],
      ['archived', '已归档'],
    ];
    let html = statuses
      .map(
        ([v, label]) =>
          `<button class="chip ${state.status === v ? 'active' : ''}" data-status="${v}">${label}</button>`
      )
      .join('');

    html += `<span style="width:1px;height:18px;background:var(--line-strong);margin:0 4px"></span>`;

    if (state.category) {
      html += `<button class="chip active" data-clear="category">${esc(state.category)} <span class="x">×</span></button>`;
    }
    if (state.tag) {
      html += `<button class="chip active" data-clear="tag">#${esc(state.tag)} <span class="x">×</span></button>`;
    }
    if (state.featured) {
      html += `<button class="chip active" data-clear="featured">精选 <span class="x">×</span></button>`;
    }

    const tags = (stats?.tags || []).filter((t) => t !== state.tag).slice(0, state.category ? 4 : 7);
    html += tags.map((t) => `<button class="chip" data-tag="${esc(t)}">#${esc(t)}</button>`).join('');

    if (state.q) {
      html += `<span style="margin-left:auto;font-size:12px;color:var(--dim)">「${esc(state.q)}」的搜索结果</span>`;
    }
    els.bar.innerHTML = html;
  }

  function titleFor() {
    if (state.q) return ['搜索结果', `关键词：${state.q}`];
    if (state.featured) return ['精选产品', '挑出来重点展示的作品'];
    if (state.category) return [state.category, `分类：${state.category}`];
    if (state.tag) return ['#' + state.tag, `标签：${state.tag}`];
    if (state.status) return [STATUS_MAP[state.status].label, '按状态筛选'];
    return ['全部产品', '收录你的网站项目、工具与实验作品'];
  }

  /* ---------------- 渲染 ---------------- */
  function render() {
    const [t, sub] = titleFor();
    els.title.innerHTML = `${esc(t)} <span class="num">${products.length}</span>`;
    els.sub.textContent = sub;
    renderFilterBar();

    if (!products.length) {
      const isFiltered = state.q || state.category || state.tag || state.status || state.featured;
      els.view.innerHTML = isFiltered
        ? emptyHTML('没有匹配的产品', '换个关键词，或者清空筛选条件再看看。', false)
        : emptyHTML('产品库还是空的', '把第一个作品放进来吧——粘贴部署链接，剩下的交给自动抓取。');
      if (isFiltered) {
        const b = document.createElement('button');
        b.className = 'btn btn-sm';
        b.textContent = '清空筛选';
        b.onclick = clearFilters;
        els.view.querySelector('.empty').appendChild(b);
      }
      return;
    }

    if (state.view === 'grid') {
      els.view.innerHTML = `<div class="grid">${products.map((p, i) => cardHTML(p, i)).join('')}</div>`;
    } else if (state.view === 'list') {
      els.view.innerHTML = `<div class="list">${products.map((p, i) => rowHTML(p, i)).join('')}</div>`;
    } else {
      els.view.innerHTML = tableHTML(products);
    }
  }

  /* ---------------- 事件 ---------------- */
  function clearFilters() {
    state.q = '';
    state.category = '';
    state.tag = '';
    state.status = '';
    state.featured = false;
    els.search.value = '';
    load();
  }

  els.view.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    const host = e.target.closest('[data-id]');
    if (btn && host) {
      const p = products.find((x) => x.id === host.dataset.id);
      if (!p) return;
      if (btn.dataset.act === 'open') {
        window.open(p.demoUrl, '_blank', 'noopener');
      } else if (btn.dataset.act === 'edit') {
        openEdit(p);
      }
      return;
    }
    if (host) {
      location.href = '/product.html?id=' + encodeURIComponent(host.dataset.id);
      return;
    }
    const add = e.target.closest('[data-act="add"]');
    if (add) openAdd();
  });

  els.bar.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.status !== undefined) {
      state.status = b.dataset.status;
      load();
    } else if (b.dataset.tag) {
      state.tag = state.tag === b.dataset.tag ? '' : b.dataset.tag;
      load();
    } else if (b.dataset.clear) {
      state[b.dataset.clear] = b.dataset.clear === 'featured' ? false : '';
      load();
    }
  });

  document.querySelector('.sidebar').addEventListener('click', (e) => {
    const f = e.target.closest('[data-filter]');
    const c = e.target.closest('[data-cat]');
    if (f) {
      const v = f.dataset.filter;
      state.category = '';
      state.tag = '';
      state.q = '';
      els.search.value = '';
      if (v === 'all') {
        state.featured = false;
        state.status = '';
      } else if (v === 'featured') {
        state.featured = true;
        state.status = '';
      } else if (v === 'live') {
        state.featured = false;
        state.status = 'live';
      }
      load();
    } else if (c) {
      const name = c.dataset.cat;
      state.category = state.category === name ? '' : name;
      state.featured = false;
      state.status = '';
      load();
    }
    closeDrawer();
  });

  els.search.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.q = els.search.value.trim();
      load();
    }, 260);
  });

  els.sort.addEventListener('change', () => {
    state.sort = els.sort.value;
    load();
  });

  $('#view-switch').addEventListener('click', (e) => {
    const b = e.target.closest('[data-view]');
    if (!b) return;
    state.view = b.dataset.view;
    Settings.view = state.view;
    $$('#view-switch button').forEach((x) => x.classList.toggle('active', x === b));
    render();
  });

  /* ---------------- 移动端抽屉侧栏 ---------------- */
  const sidebar = document.querySelector('.sidebar');
  const drawerMask = $('#drawer-mask');
  function openDrawer() {
    sidebar.classList.add('open');
    drawerMask.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    if (!sidebar.classList.contains('open')) return;
    sidebar.classList.remove('open');
    drawerMask.classList.remove('open');
    if (!document.querySelector('.modal-mask.open')) document.body.style.overflow = '';
  }
  $('#btn-menu').onclick = () => (sidebar.classList.contains('open') ? closeDrawer() : openDrawer());
  drawerMask.onclick = closeDrawer;

  /* ---------------- 弹窗基础 ---------------- */
  function openMask(id) {
    $('#' + id).classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMask(id) {
    $('#' + id).classList.remove('open');
    if (!document.querySelector('.modal-mask.open')) document.body.style.overflow = '';
  }
  document.addEventListener('click', (e) => {
    const c = e.target.closest('[data-close]');
    if (c) closeMask(c.dataset.close + '-mask');
    if (e.target.classList.contains('modal-mask')) closeMask(e.target.id);
  });

  /* ---------------- 标签输入 ---------------- */
  function renderTags() {
    const box = $('#tag-input');
    box.querySelectorAll('.tag').forEach((t) => t.remove());
    const input = box.querySelector('input');
    formTags.forEach((t) => {
      const el = document.createElement('span');
      el.className = 'tag tag-brand';
      el.innerHTML = `${esc(t)}<button type="button" aria-label="移除">×</button>`;
      el.querySelector('button').onclick = () => {
        formTags = formTags.filter((x) => x !== t);
        renderTags();
      };
      box.insertBefore(el, input);
    });
  }
  function addTag(v) {
    const t = String(v || '').trim().replace(/^#/, '').slice(0, 20);
    if (t && !formTags.includes(t) && formTags.length < 12) {
      formTags.push(t);
      renderTags();
    }
  }
  $('#tag-input input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === '，') {
      e.preventDefault();
      addTag(e.target.value);
      e.target.value = '';
    } else if (e.key === 'Backspace' && !e.target.value && formTags.length) {
      formTags.pop();
      renderTags();
    }
  });
  $('#tag-input input').addEventListener('blur', (e) => {
    if (e.target.value.trim()) {
      addTag(e.target.value);
      e.target.value = '';
    }
  });

  /* ---------------- 添加 / 编辑 ---------------- */
  function resetForm() {
    editingId = null;
    formMeta = {};
    formTags = [];
    $('#product-form').reset();
    $('#f-id').value = '';
    $('#tag-input input').value = '';
    $('#private-note').style.display = 'none';
    $('#btn-delete').style.display = 'none';
    $('#fetch-state').textContent = '填好后点击「自动抓取」，读取站点标题、简介与图标';
    $('#fetch-state').style.color = '';
    $('#gh-state').textContent = '公开仓库可直接同步 Star、语言与最近提交';
    $('#gh-state').style.color = '';
    renderTags();
  }

  function openAdd() {
    resetForm();
    $('#modal-title').textContent = '添加产品';
    $('#modal-sub').textContent = '粘贴链接，其余信息可以自动抓取';
    if (state.category) $('#f-category').value = state.category;
    openMask('modal-mask');
    setTimeout(() => $('#f-demo').focus(), 120);
  }

  function openEdit(p) {
    resetForm();
    editingId = p.id;
    $('#modal-title').textContent = '编辑产品';
    $('#modal-sub').textContent = p.name;
    $('#f-id').value = p.id;
    $('#f-name').value = p.name || '';
    $('#f-tagline').value = p.tagline || '';
    $('#f-desc').value = p.description || '';
    $('#f-demo').value = p.demoUrl || '';
    $('#f-repo').value = p.repoUrl || '';
    $('#f-category').value = p.category || '';
    $('#f-status').value = p.status || 'live';
    $('#f-cover').value = p.cover || '';
    $('#f-tech').value = (p.tech || []).join(', ');
    $('#f-notes').value = p.notes || '';
    $('#f-featured').checked = !!p.featured;
    $('#f-private').checked = !!p.isPrivate;
    $('#private-note').style.display = p.isPrivate ? 'flex' : 'none';
    formTags = [...(p.tags || [])];
    formMeta = {
      stars: p.stars,
      forks: p.forks,
      language: p.language,
      repoPushedAt: p.repoPushedAt,
      icon: p.icon || '',
    };
    renderTags();
    $('#btn-delete').style.display = 'inline-flex';
    openMask('modal-mask');
  }

  $('#btn-add').onclick = openAdd;

  $('#f-private').onchange = (e) => {
    $('#private-note').style.display = e.target.checked ? 'flex' : 'none';
  };

  /* 自动抓取站点信息 */
  $('#btn-fetch').onclick = async () => {
    const url = $('#f-demo').value.trim();
    if (!url) {
      toast('请先填写部署链接', 'err');
      $('#f-demo').focus();
      return;
    }
    const st = $('#fetch-state');
    const btn = $('#btn-fetch');
    st.innerHTML = '<span class="spinner"></span> 正在读取站点信息…';
    st.style.color = '';
    btn.disabled = true;
    try {
      const meta = await API.meta(url);
      if (!$('#f-name').value.trim()) $('#f-name').value = meta.title || meta.siteName || '';
      if (!$('#f-tagline').value.trim()) $('#f-tagline').value = meta.description || '';
      if (meta.icon) formMeta.icon = meta.icon;
      if (meta.finalUrl && meta.finalUrl !== url) $('#f-demo').value = meta.finalUrl;
      if (!$('#f-cover').value.trim() && meta.image) $('#f-cover').value = meta.image;
      st.innerHTML = `${icon('check')} 已读取 ${esc(hostOf(meta.finalUrl || url))}：${esc(meta.title || meta.siteName || '')}`;
      st.style.color = '#6ee7b7';
    } catch (e) {
      st.innerHTML = `${icon('alert')} ${esc(e.message)}`;
      st.style.color = '#ff9a9a';
    } finally {
      btn.disabled = false;
    }
  };

  /* 同步 GitHub */
  $('#btn-gh').onclick = async () => {
    const repo = $('#f-repo').value.trim();
    if (!repo) {
      toast('请先填写 GitHub 仓库地址', 'err');
      $('#f-repo').focus();
      return;
    }
    const st = $('#gh-state');
    const btn = $('#btn-gh');
    st.innerHTML = '<span class="spinner"></span> 正在请求 GitHub…';
    st.style.color = '';
    btn.disabled = true;
    try {
      const d = await API.github(repo);
      formMeta.stars = d.stars;
      formMeta.forks = d.forks;
      formMeta.language = d.language || '';
      formMeta.repoPushedAt = d.pushedAt || '';
      if (!$('#f-name').value.trim()) $('#f-name').value = d.name || '';
      if (!$('#f-tagline').value.trim() && d.description) $('#f-tagline').value = d.description;
      if (!$('#f-tech').value.trim() && d.language) $('#f-tech').value = d.language;
      (d.topics || []).slice(0, 4).forEach(addTag);
      if (d.isPrivate) {
        $('#f-private').checked = true;
        $('#private-note').style.display = 'flex';
      }
      st.innerHTML = `${icon('check')} ★ ${fmtNum(d.stars)} · ⑂ ${fmtNum(d.forks)} · ${esc(d.language || '—')} · 更新于 ${timeAgo(d.pushedAt)}`;
      st.style.color = '#6ee7b7';
    } catch (e) {
      st.innerHTML = `${icon('alert')} ${esc(e.message)}`;
      st.style.color = '#ff9a9a';
    } finally {
      btn.disabled = false;
    }
  };

  /* 保存 */
  $('#product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#f-name').value.trim();
    const demoUrl = $('#f-demo').value.trim();
    if (!name) return toast('请填写产品名称', 'err'), $('#f-name').focus();
    if (!demoUrl) return toast('请填写部署链接', 'err'), $('#f-demo').focus();

    const payload = {
      name,
      tagline: $('#f-tagline').value.trim(),
      description: $('#f-desc').value.trim(),
      demoUrl,
      repoUrl: $('#f-repo').value.trim(),
      isPrivate: $('#f-private').checked,
      category: $('#f-category').value.trim() || '未分类',
      status: $('#f-status').value,
      cover: $('#f-cover').value.trim(),
      notes: $('#f-notes').value.trim(),
      featured: $('#f-featured').checked,
      tags: formTags,
      tech: $('#f-tech').value.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
      stars: formMeta.stars ?? null,
      forks: formMeta.forks ?? null,
      language: formMeta.language || '',
      repoPushedAt: formMeta.repoPushedAt || '',
      icon: formMeta.icon || '',
    };

    const btn = $('#btn-save');
    btn.disabled = true;
    btn.textContent = '保存中…';
    try {
      if (editingId) {
        await API.update(editingId, payload);
        toast('产品已更新');
      } else {
        await API.create(payload);
        toast('产品已添加');
      }
      closeMask('modal-mask');
      load();
    } catch (err) {
      toast(err.message, 'err');
    } finally {
      btn.disabled = false;
      btn.textContent = '保存产品';
    }
  });

  /* 删除 */
  let pendingDelete = null;
  $('#btn-delete').onclick = () => {
    const name = $('#f-name').value || '该产品';
    confirmAction({
      title: '删除产品',
      desc: `确定删除「${name}」吗？此操作无法撤销。`,
      okText: '删除',
      onOk: async () => {
        try {
          await API.remove(editingId);
          closeMask('modal-mask');
          toast('已删除');
          load();
        } catch (e) {
          toast(e.message, 'err');
        }
      },
    });
  };

  function confirmAction({ title, desc, okText = '确认', onOk }) {
    $('#confirm-title').textContent = title;
    $('#confirm-desc').textContent = desc;
    $('#confirm-ok').textContent = okText;
    pendingDelete = onOk;
    openMask('confirm-mask');
  }
  $('#confirm-ok').onclick = async () => {
    const fn = pendingDelete;
    pendingDelete = null;
    closeMask('confirm-mask');
    if (fn) await fn();
  };

  /* ---------------- 设置 ---------------- */
  function openSettings() {
    closeDrawer();
    $('#f-token').value = Settings.token;
    openMask('settings-mask');
  }
  $('#btn-settings').onclick = openSettings;
  $('#btn-settings-2').onclick = openSettings;
  $('#btn-save-token').onclick = () => {
    Settings.token = $('#f-token').value.trim();
    closeMask('settings-mask');
    toast('设置已保存');
  };
  $('#btn-clear-token').onclick = () => {
    Settings.token = '';
    $('#f-token').value = '';
    toast('Token 已清除');
  };

  /* ---------------- 键盘 ---------------- */
  document.addEventListener('keydown', (e) => {
    const meta = e.metaKey || e.ctrlKey;
    if (meta && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      els.search.focus();
      els.search.select();
    }
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      els.search.focus();
    }
    if (e.key === 'Escape') {
      closeDrawer();
      const open = document.querySelector('.modal-mask.open');
      if (open) closeMask(open.id);
    }
  });

  /* ---------------- 环境提示 ---------------- */
  let envChecked = false;
  async function detectEnv() {
    if (envChecked) return;
    envChecked = true;
    try {
      const h = await API.health();
      if (h.ephemeral) $('#env-note').hidden = false;
    } catch {}
  }

  /* ---------------- 初始化 ---------------- */
  $$('#view-switch button').forEach((b) => b.classList.toggle('active', b.dataset.view === state.view));
  els.sort.value = state.sort;

  const params = new URLSearchParams(location.search);
  if (params.get('category')) state.category = params.get('category');
  if (params.get('tag')) state.tag = params.get('tag');
  if (params.get('status')) state.status = params.get('status');
  if (params.get('q')) {
    state.q = params.get('q');
    els.search.value = state.q;
  }

  load().then(async () => {
    detectEnv();
    if (params.get('new') === '1') openAdd();
    if (params.get('settings') === '1') openSettings();
    if (params.get('edit')) {
      try {
        const p = await API.get(params.get('edit'));
        openEdit(p);
      } catch (e) {
        toast(e.message, 'err');
      }
    }
  });
})();
