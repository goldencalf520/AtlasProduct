/* 首页逻辑 */
(function () {
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  initReveal();

  function animateNum(el, target, fmt = (v) => String(v)) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = fmt(target);
      return;
    }
    const dur = 900;
    const start = performance.now();
    const from = 0;
    function tick(t) {
      const p = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(from + (target - from) * e));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    // 兜底：即使 rAF 被暂停（后台标签页），也保证最终值正确
    setTimeout(() => { el.textContent = fmt(target); }, dur + 120);
  }

  async function loadStats() {
    try {
      const s = await API.stats();
      document.querySelector('[data-stat="total"]').textContent = s.total;
      animateNum(document.querySelector('[data-stat="live"]'), s.live);
      animateNum(document.querySelector('[data-stat="categories"]'), s.categories.length);
      animateNum(document.querySelector('[data-stat="stars"]'), s.stars, fmtNum);
      document.getElementById('eyebrow-count').textContent = `已收录 ${s.total} 个作品`;
      document.getElementById('fc-live').textContent = `${s.live} 个产品已上线`;
    } catch (e) {
      document.getElementById('eyebrow-count').textContent = '本地产品库';
    }
  }

  async function loadRecent() {
    const grid = document.getElementById('recent-grid');
    try {
      const { products } = await API.list({ sort: 'updated' });
      const list = products.slice(0, 3);
      if (!list.length) {
        grid.innerHTML = emptyHTML('产品库还是空的', '添加第一个作品，它会出现在这里。');
        grid.querySelector('[data-act="add"]').onclick = () => (location.href = '/app.html?new=1');
        return;
      }
      grid.innerHTML = list.map((p, i) => cardHTML(p, i)).join('');
      grid.querySelectorAll('.p-card').forEach((el) => {
        el.addEventListener('click', (ev) => {
          if (ev.target.closest('[data-act]')) return;
          location.href = '/product.html?id=' + encodeURIComponent(el.dataset.id);
        });
      });
    } catch {
      grid.innerHTML = `<div class="empty" style="grid-column:1/-1"><p>无法连接服务，请确认已运行 <code class="mono">node server.js</code></p></div>`;
    }
  }

  loadStats();
  loadRecent();
})();
