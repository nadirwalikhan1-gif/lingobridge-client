// fix-final.mjs — ES module version for your project
import fs from 'fs';
import path from 'path';

const ADMIN_DIR = path.join(process.cwd(), 'src', 'features', 'admin');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  // Fix path depth: ../../lib/ -> ../../../lib/
  content = content.replace(/from "\.\.\/\.\.\/lib\//g, 'from "../../../lib/');
  
  // Fix path depth: ../../components/ -> ../../../components/
  content = content.replace(/from "\.\.\/\.\.\/components\//g, 'from "../../../components/');
  
  // Fix api import: import api from -> import { api } from
  content = content.replace(/import api from "(\.\.\/)*lib\/api";/g, 'import { api } from "$1lib/api";');
  
  // Remove dead imports
  content = content.replace(/import\s+\{\s*useAdminApi\s*\}\s+from\s+"[^"]+";?\n?/g, '');
  content = content.replace(/import\s+\{\s*useAdminSocket\s*\}\s+from\s+"[^"]+";?\n?/g, '');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
    return true;
  }
  return false;
}

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let fixed = 0;
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      fixed += scanDir(fullPath);
    } else if (entry.name.endsWith('.jsx')) {
      if (fixFile(fullPath)) fixed++;
    }
  }
  return fixed;
}

console.log('=== Fixing Admin Imports ===\n');
const count = scanDir(ADMIN_DIR);
console.log(`\nFixed ${count} files.`);

// Verify
console.log('\n=== Verifying ===');
const files = [];
function collectFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) collectFiles(fullPath);
    else if (entry.name.endsWith('.jsx')) files.push(fullPath);
  }
}
collectFiles(ADMIN_DIR);

let bad = 0;
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('from "../../lib/') || 
        line.includes('from "../../components/') ||
        line.includes('import api from') && line.includes('lib/api')) {
      console.log(`❌ ${path.relative(process.cwd(), file)}:${i+1}  ${line.trim()}`);
      bad++;
    }
  }
}

if (bad === 0) {
  console.log('\n✅ All clean! Run: npm run build');
} else {
  console.log(`\n❌ ${bad} issues remain.`);
}