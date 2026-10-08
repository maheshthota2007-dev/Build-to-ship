import fs from 'fs';
import path from 'path';

const uiDir = path.resolve('artifacts/cyberquest-ai/src/components/ui');
const files = fs.readdirSync(uiDir);

for (const f of files) {
  const p = path.join(uiDir, f);
  if (fs.statSync(p).isFile() && (f.endsWith('.tsx') || f.endsWith('.ts'))) {
    let content = fs.readFileSync(p, 'utf8');
    if (content.includes("'use client';")) {
      content = content.replace(/'use client';\r?\n?/, '');
      fs.writeFileSync(p, content, 'utf8');
      console.log('Removed use client from:', f);
    }
  }
}
