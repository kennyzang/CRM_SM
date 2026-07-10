const fs = require('fs');
const path = require('path');
const markdownIt = require('markdown-it');

const DOCS_DIR = path.join(__dirname, '../doc/manual');

const md = markdownIt({
  html: true,
  linkify: true,
  typographer: true
});

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
      const html = md.render(content);
      const stats = fs.statSync(filePath);

      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : moduleId;

      const meta = {};
      const metaMatches = content.match(/^>\s*([^:]+):\s*(.+)$/gm);
      if (metaMatches) {
        metaMatches.forEach(m => {
          const [, key, value] = m.match(/>\s*([^:]+):\s*(.+)/);
          meta[key.trim()] = value.trim();
        });
      }

      return {
        title,
        content: html.substring(0, 200) + '...',
        updateTime: stats.mtime.toISOString(),
        meta
      };
    }
  } catch (err) {
    console.error('Failed to get doc content:', err);
  }

  return null;
}

const docIds = ['1-contact', '2-lead', '3-lead-convert', '4-P&L'];

console.log('Testing doc API responses:\n');
docIds.forEach(id => {
  const doc = getDocContent(id);
  if (doc) {
    console.log(`=== Doc ID: ${id} ===`);
    console.log(`Title: ${doc.title}`);
    console.log(`Meta:`, doc.meta);
    console.log(`Preview: ${doc.content.substring(0, 100)}...`);
    console.log('');
  } else {
    console.log(`=== Doc ID: ${id} === (not found)`);
    console.log('');
  }
});
