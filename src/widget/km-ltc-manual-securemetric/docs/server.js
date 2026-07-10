const express = require('express');
const fs = require('fs');
const path = require('path');
const markdownIt = require('markdown-it');
const hljs = require('highlight.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure markdown-it
const md = markdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }
    return '';
  }
});

// Add anchor plugin
md.use(require('markdown-it-anchor'), {
  level: 2,
  slugify: function(s) {
    return encodeURIComponent(String(s).trim().toLowerCase().replace(/\s+/g, '-'));
  }
});

// Serve static files
app.use(express.static('public'));

// Documentation directory path
const DOCS_DIR = path.join(__dirname, '../doc/manual');

// Get documentation structure
function getDocStructure() {
  const structure = [];

  try {
    const modules = fs.readdirSync(DOCS_DIR, { withFileTypes: true });

    modules.forEach(module => {
      if (module.isDirectory()) {
        const modulePath = path.join(DOCS_DIR, module.name);
        const files = fs.readdirSync(modulePath);

        const zhFile = files.find(f => f.endsWith('-zh.md'));
        const enFile = files.find(f => f.endsWith('-en.md'));
        const defaultFile = files.find(f => f.endsWith('.md') && !f.endsWith('-zh.md') && !f.endsWith('-en.md'));

        const docFile = zhFile || defaultFile;
        if (docFile) {
          const filePath = path.join(modulePath, docFile);
          const stats = fs.statSync(filePath);

          // Extract title from first heading
          let title = module.name;
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            const match = content.match(/^#\s+(.+)$/m);
            if (match) {
              title = match[1];
            }
          } catch (e) {
            console.error(`Failed to read file: ${filePath}`, e);
          }

          structure.push({
            id: module.name,
            name: module.name,
            title: title,
            zhFile: zhFile,
            enFile: enFile,
            updateTime: stats.mtime.toISOString(),
            path: `/docs/${module.name}`
          });
        }
      }
    });

    // Sort by name
    structure.sort((a, b) => a.name.localeCompare(b.name));

  } catch (err) {
    console.error('Failed to get doc structure:', err);
  }

  return structure;
}

// Get document content
function getDocContent(moduleId, lang = 'zh') {
  const modulePath = path.join(DOCS_DIR, moduleId);

  try {
    const files = fs.readdirSync(modulePath);
    let docFile;

    if (lang === 'en' && files.find(f => f.endsWith('-en.md'))) {
      docFile = files.find(f => f.endsWith('-en.md'));
    } else if (files.find(f => f.endsWith('-zh.md'))) {
      docFile = files.find(f => f.endsWith('-zh.md'));
    } else {
      docFile = files.find(f => f.endsWith('.md') && !f.endsWith('-zh.md') && !f.endsWith('-en.md'));
    }

    if (docFile) {
      const filePath = path.join(modulePath, docFile);
      const content = fs.readFileSync(filePath, 'utf8');

      // Rewrite relative screenshot paths to absolute API paths
      const processedContent = content.replace(/!\[([^\]]+)\]\((screenshots\/[^\)]+)\)/g, (match, alt, imgPath) => {
        const absPath = `/images/${moduleId}/${path.basename(imgPath)}`;
        return `![${alt}](${absPath})`;
      });

      const html = md.render(processedContent);
      const stats = fs.statSync(filePath);

      // Extract title
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : moduleId;

      // Extract meta info (supports both ASCII colon ":" and fullwidth colon "\uFF1A")
      const meta = {};
      const metaMatches = content.match(/^>\s*([^\uFF1A:]+)[\uFF1A:]\s*(.+)$/gm);
      if (metaMatches) {
        metaMatches.forEach(m => {
          const [, key, value] = m.match(/>\s*([^\uFF1A:]+)[\uFF1A:]\s*(.+)/);
          meta[key.trim()] = value.trim();
        });
      }

      return {
        title,
        content: html,
        updateTime: stats.mtime.toISOString(),
        meta
      };
    }
  } catch (err) {
    console.error('Failed to get doc content:', err);
  }

  return null;
}

// API: list all documents
app.get('/api/docs', (req, res) => {
  const docs = getDocStructure();
  res.json(docs);
});

// API: get single document content
app.get('/api/docs/:id', (req, res) => {
  const { id } = req.params;
  const { lang } = req.query;
  const doc = getDocContent(id, lang);

  if (doc) {
    res.json(doc);
  } else {
    res.status(404).json({ error: 'Document not found' });
  }
});

// Proxy screenshot images
app.use('/images/:module/:file', (req, res) => {
  const { module, file } = req.params;
  const imgPath = path.join(DOCS_DIR, module, 'screenshots', file);

  if (fs.existsSync(imgPath)) {
    res.sendFile(imgPath);
  } else {
    res.status(404).send('Image not found');
  }
});

// Main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Doc page - support real URL paths (SPA)
app.get('/docs/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// All other paths return main page (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`\nDocs server started`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Docs: ${DOCS_DIR}`);
  console.log(`Press Ctrl+C to stop\n`);
});

module.exports = app;
