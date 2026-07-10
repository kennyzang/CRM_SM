const fs = require('fs');
const path = require('path');
const DOCS_DIR = path.join(__dirname, '../doc/manual');

function getDocStructure() {
  const structure = [];

  try {
    const modules = fs.readdirSync(DOCS_DIR, { withFileTypes: true });
    console.log('Found modules:', modules.map(m => m.name));

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

          let title = module.name;
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            const match = content.match(/^#\s+(.+)$/m);
            if (match) {
              title = match[1];
            }
          } catch (e) {
            console.error('Failed to read file:', filePath, e);
          }

          structure.push({
            id: module.name,
            name: module.name,
            title: title,
            updateTime: stats.mtime.toISOString(),
            path: '/docs/' + module.name
          });
        }
      }
    });

    structure.sort((a, b) => a.name.localeCompare(b.name));

  } catch (err) {
    console.error('Failed to get doc structure:', err);
  }

  return structure;
}

const docs = getDocStructure();
console.log('\nDoc list:');
docs.forEach((d, i) => console.log(`${i + 1}. id: ${d.id}, title: ${d.title}`));
