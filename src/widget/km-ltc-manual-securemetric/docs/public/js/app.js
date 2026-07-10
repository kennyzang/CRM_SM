// Static mode — no Node.js server required.
// Open with VS Code Live Server: http://127.0.0.1:5500/.../docs/public/index.html
// Markdown is rendered client-side via marked.js.

const MANUAL_BASE = '../manual';   // relative to public/
const MANIFEST    = '../manifest.json';

class DocApp {
  constructor() {
    this.modules      = [];
    this.currentId    = null;
    this.lang         = localStorage.getItem('manual-lang') || 'en';
    this.searchIndex  = [];      // [{moduleId, moduleTitle, stepTitle, body}]
    this.indexLang    = null;    // which lang the index was built for
    this.searchTimer  = null;
    this.init();
  }

  async init() {
    this.applyLangUI();
    await this.loadManifest();
    this.setupRouter();
    this.updateTime();
    setInterval(() => this.updateTime(), 60000);
    // Build index in background after UI is ready
    this.buildSearchIndex();
  }

  // ── Language ─────────────────────────────────────────────────────────────────

  setLang(lang) {
    if (this.lang === lang) return;
    this.lang = lang;
    localStorage.setItem('manual-lang', lang);
    this.applyLangUI();
    // Rebuild index for new language
    this.searchIndex = [];
    this.indexLang = null;
    this.buildSearchIndex();
    const q = document.getElementById('search-input')?.value?.trim();
    if (q) {
      this.onSearch(q);
    } else if (this.currentId) {
      this.loadDoc(this.currentId);
    } else {
      this.renderHome();
    }
  }

  applyLangUI() {
    document.getElementById('btn-en')?.classList.toggle('active', this.lang === 'en');
    document.getElementById('btn-zh')?.classList.toggle('active', this.lang === 'zh');
  }

  // ── Manifest ────────────────────────────────────────────────────────────────

  async loadManifest() {
    try {
      const res = await fetch(MANIFEST);
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      this.modules = data.modules;
      this.renderSidebar();
    } catch (e) {
      console.error('Failed to load manifest:', e);
      this.renderError('Could not load module list. Make sure the server or Live Server is running.');
    }
  }

  // ── Search Index ─────────────────────────────────────────────────────────────

  async buildSearchIndex() {
    if (this.indexLang === this.lang) return;
    const index = [];
    for (const mod of this.modules) {
      const markdown = await this.fetchMarkdown(mod);
      if (!markdown) continue;
      // Split into sections by ## headings
      const sections = this.parseSections(markdown);
      for (const sec of sections) {
        index.push({
          moduleId:    mod.id,
          moduleTitle: mod.title,
          stepTitle:   sec.title,
          body:        sec.body,
        });
      }
    }
    this.searchIndex = index;
    this.indexLang   = this.lang;
  }

  parseSections(markdown) {
    // Remove YAML-like frontmatter blockquotes and the H1 title
    const lines  = markdown.split('\n');
    const result = [];
    let currentTitle = '';
    let currentLines = [];

    const flush = () => {
      if (currentTitle || currentLines.length) {
        result.push({ title: currentTitle, body: currentLines.join('\n').trim() });
      }
      currentTitle = '';
      currentLines = [];
    };

    for (const line of lines) {
      if (/^#{1,2}\s/.test(line)) {
        flush();
        // Strip markdown heading markers
        currentTitle = line.replace(/^#{1,2}\s+/, '').trim();
      } else {
        currentLines.push(line);
      }
    }
    flush();
    return result;
  }

  search(query) {
    if (!query) return [];
    const q = query.toLowerCase();
    const results = [];
    for (const entry of this.searchIndex) {
      const titleMatch = entry.stepTitle.toLowerCase().includes(q);
      const bodyIdx    = entry.body.toLowerCase().indexOf(q);
      if (!titleMatch && bodyIdx === -1) continue;

      // Build excerpt around first match in body
      let excerpt = '';
      if (bodyIdx !== -1) {
        const start   = Math.max(0, bodyIdx - 60);
        const end     = Math.min(entry.body.length, bodyIdx + q.length + 60);
        const raw     = entry.body.slice(start, end)
          .replace(/!\[.*?\]\(.*?\)/g, '')   // strip images
          .replace(/\[([^\]]+)\]\(.*?\)/g, '$1') // strip links
          .replace(/[#*`>_]/g, '')            // strip md symbols
          .replace(/\s+/g, ' ')
          .trim();
        excerpt = (start > 0 ? '…' : '') + raw + (end < entry.body.length ? '…' : '');
      }
      results.push({ ...entry, excerpt, query });
    }
    return results;
  }

  // ── Search UI ────────────────────────────────────────────────────────────────

  onSearch(value) {
    clearTimeout(this.searchTimer);
    const q = value.trim();
    document.getElementById('search-clear')?.classList.toggle('visible', q.length > 0);
    if (!q) {
      // Restore current view
      if (this.currentId) this.loadDoc(this.currentId);
      else this.renderHome();
      return;
    }
    // Debounce 200ms
    this.searchTimer = setTimeout(() => this.renderSearchResults(q), 200);
  }

  clearSearch() {
    const input = document.getElementById('search-input');
    if (input) { input.value = ''; input.focus(); }
    document.getElementById('search-clear')?.classList.remove('visible');
    if (this.currentId) this.loadDoc(this.currentId);
    else this.renderHome();
  }

  renderSearchResults(query) {
    const results = this.search(query);
    const main = document.querySelector('.main-content');

    if (results.length === 0) {
      main.innerHTML = `
        <div class="search-results-view">
          <div class="search-results-header">
            <span class="search-results-count">No results for "<strong>${this.esc(query)}</strong>"</span>
          </div>
          <div class="search-empty">
            <div class="search-empty-icon">🔍</div>
            <p>Try different keywords or check the spelling.</p>
          </div>
        </div>`;
      return;
    }

    // Group by module
    const byModule = {};
    for (const r of results) {
      if (!byModule[r.moduleId]) byModule[r.moduleId] = { title: r.moduleTitle, hits: [] };
      byModule[r.moduleId].hits.push(r);
    }

    const total = results.length;
    let html = `
      <div class="search-results-view">
        <div class="search-results-header">
          <span class="search-results-count"><strong>${total}</strong> result${total !== 1 ? 's' : ''} for "<strong>${this.esc(query)}</strong>"</span>
        </div>`;

    for (const [moduleId, group] of Object.entries(byModule)) {
      html += `<div class="search-module-group">
        <div class="search-module-title" onclick="app.navigate('${moduleId}')">
          <span class="search-module-icon">📄</span>${this.esc(group.title)}
          <span class="search-module-count">${group.hits.length}</span>
        </div>`;
      for (const hit of group.hits) {
        const title   = this.highlight(hit.stepTitle, query);
        const excerpt = this.highlight(hit.excerpt, query);
        html += `
        <div class="search-result-item" onclick="app.navigate('${hit.moduleId}')">
          <div class="search-result-title">${title}</div>
          ${excerpt ? `<div class="search-result-excerpt">${excerpt}</div>` : ''}
        </div>`;
      }
      html += `</div>`;
    }
    html += `</div>`;
    main.innerHTML = html;
  }

  highlight(text, query) {
    if (!text || !query) return this.esc(text);
    const escaped = this.esc(text);
    const escapedQ = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return escaped.replace(new RegExp(`(${escapedQ})`, 'gi'), '<mark>$1</mark>');
  }

  // ── Routing ─────────────────────────────────────────────────────────────────

  setupRouter() {
    window.addEventListener('popstate', () => this.handleRoute());
    this.handleRoute();
  }

  handleRoute() {
    const hash = window.location.hash;  // e.g. #/docs/1-contact
    if (hash.startsWith('#/docs/')) {
      const id = hash.replace('#/docs/', '');
      this.loadDoc(id);
    } else {
      this.renderHome();
    }
  }

  navigate(id) {
    window.location.hash = id ? `#/docs/${id}` : '';
    this.updateNavActive(id);
  }

  goHome() {
    this.currentId = null;
    this.navigate('');
    this.renderHome();
  }

  // ── Document loading ─────────────────────────────────────────────────────────

  async fetchMarkdown(mod) {
    const candidates = this.lang === 'en'
      ? [`${mod.fileBase}-en.md`, `${mod.fileBase}-zh.md`, `${mod.fileBase}.md`]
      : [`${mod.fileBase}-zh.md`, `${mod.fileBase}-en.md`, `${mod.fileBase}.md`];
    for (const fn of candidates) {
      try {
        const res = await fetch(`${MANUAL_BASE}/${mod.id}/${fn}`);
        if (res.ok) return await res.text();
      } catch (_) {}
    }
    return null;
  }

  async loadDoc(id) {
    this.currentId = id;
    this.updateNavActive(id);
    this.renderLoading();

    const mod = this.modules.find(m => m.id === id);
    if (!mod) { this.renderError(`Module "${id}" not found in manifest.`); return; }

    let markdown = await this.fetchMarkdown(mod);

    if (!markdown) {
      this.renderError(`Could not load document for "${mod.title}".`);
      return;
    }

    // Rewrite relative screenshot paths so they resolve from public/
    // screenshots/foo.png  →  ../manual/1-contact/screenshots/foo.png
    markdown = markdown.replace(
      /!\[([^\]]*)\]\(screenshots\/([^)]+)\)/g,
      `![$1](${MANUAL_BASE}/${id}/screenshots/$2)`
    );

    const html = marked.parse(markdown);
    this.renderDocView(mod, html);
  }

  // ── Rendering ────────────────────────────────────────────────────────────────

  renderSidebar() {
    const nav = document.querySelector('.nav-section');
    if (!this.modules.length) {
      nav.innerHTML = '<p style="padding:12px;color:#888">No documents found</p>';
      return;
    }
    const items = this.modules.map(m => `
      <li>
        <a href="#/docs/${m.id}" onclick="app.navigate('${m.id}')">
          <span class="nav-icon">📄</span>
          <span class="nav-text">${this.esc(m.title)}</span>
        </a>
      </li>`).join('');
    nav.innerHTML = `<ul>${items}</ul>`;
    this.updateNavActive(this.currentId);
  }

  updateNavActive(id) {
    document.querySelectorAll('.nav-section a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#/docs/${id}`);
    });
  }

  renderHome() {
    const main = document.querySelector('.main-content');
    const cards = this.modules.map(m => `
      <div class="doc-card" onclick="app.navigate('${m.id}')">
        <div class="card-icon">📖</div>
        <h3>${this.esc(m.title)}</h3>
        <p>Click to view the step-by-step guide</p>
      </div>`).join('');

    main.innerHTML = `
      <div class="home-view">
        <div class="hero">
          <h2>CRM User Manual</h2>
          <p>Step-by-step guides for each module. Select a topic from the sidebar or click a card below.</p>
        </div>
        <div class="doc-cards">${cards}</div>
      </div>`;
  }

  renderLoading() {
    document.querySelector('.main-content').innerHTML = `
      <div class="doc-view">
        <div class="loading-full">
          <div class="spinner"></div>
          <p>Loading document...</p>
        </div>
      </div>`;
  }

  renderError(msg) {
    document.querySelector('.main-content').innerHTML = `
      <div class="doc-view">
        <div class="error"><p>${this.esc(msg)}</p></div>
      </div>`;
  }

  renderDocView(mod, html) {
    // Strip duplicate H1 title (already shown in header area if desired)
    const content = html.replace(/^<h1[^>]*>.*?<\/h1>\s*/i, '');

    document.querySelector('.main-content').innerHTML = `
      <div class="doc-view">
        <div class="doc-content">
          <div class="doc-header">
            <button class="back-btn" onclick="app.goHome()">&#8592; Back</button>
            <h2>${this.esc(mod.title)}</h2>
          </div>
          <article class="markdown-content">${content}</article>
        </div>
      </div>`;

    // Syntax highlighting for code blocks
    if (window.hljs) {
      document.querySelectorAll('pre code').forEach(b => hljs.highlightElement(b));
    }
    // Zoom images on click
    document.querySelectorAll('.markdown-content img').forEach(img => {
      img.style.cursor = 'zoom-in';
      img.title = 'Click to enlarge';
      img.addEventListener('click', () => this.lightbox(img.src, img.alt));
    });
  }

  lightbox(src, alt) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;z-index:9999;cursor:zoom-out';
    overlay.innerHTML = `<img src="${src}" alt="${this.esc(alt)}" style="max-width:92vw;max-height:92vh;border-radius:4px;box-shadow:0 8px 32px rgba(0,0,0,.6)">`;
    overlay.addEventListener('click', () => overlay.remove());
    document.body.appendChild(overlay);
  }

  // ── Utilities ────────────────────────────────────────────────────────────────

  updateTime() {
    const el = document.querySelector('.update-date');
    if (el) el.textContent = new Date().toLocaleString('en-US', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
  }

  esc(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
  }
}

const app = new DocApp();

document.querySelector('.logo')?.addEventListener('click', () => app.goHome());
