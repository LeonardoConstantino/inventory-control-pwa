import fs from 'fs';
import path from 'path';

/**
 * Lê todos os arquivos do projeto recursivamente,
 * ignorando pastas irrelevantes como node_modules, dist, build etc.
 */
function readAllFiles(dir, exts = ['.ts', '.tsx', '.js', '.jsx']) {
  const ignoredDirs = new Set([
    'node_modules',
    'dist',
    'build',
    '.git',
    '.next',
    'out',
    'coverage',
  ]);

  const files = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name)) continue; // pula diretórios ignorados
      files.push(...readAllFiles(fullPath, exts));
    } else if (exts.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Extrai todas as importações de um arquivo.
 */
function extractImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const regex = /from\s+['"]([^'"]+)['"]/g;
  const imports = [];
  let match;
  while ((match = regex.exec(content))) {
    imports.push(match[1]);
  }
  return imports;
}

/**
 * Analisa os arquivos e encontra componentes não utilizados.
 */
function findUnusedComponents(srcDir) {
  const allFiles = readAllFiles(srcDir);
  const importsSet = new Set();

  // Mapeia importações relativas
  for (const file of allFiles) {
    const imports = extractImports(file);
    for (const imp of imports) {
      if (imp.startsWith('.')) {
        const resolved = path.resolve(path.dirname(file), imp);
        importsSet.add(resolved);
      }
    }
  }

  // Filtra arquivos que não são importados
  const unused = allFiles.filter((f) => {
    const base = f.replace(/\.(tsx?|jsx?)$/, '');
    return !importsSet.has(base);
  });

  return unused;
}

/**
 * Execução principal
 */
const srcPath = path.resolve(process.cwd(), './');
const unused = findUnusedComponents(srcPath);

console.log('\n🧹 Componentes não utilizados encontrados:\n');
if (unused.length === 0) {
  console.log('✅ Nenhum componente não utilizado encontrado.');
} else {
  for (const file of unused) console.log('-', path.relative(srcPath, file));

  // Remoção opcional
  const confirm = process.env.DELETE_UNUSED === 'true';
  if (confirm) {
    for (const file of unused) fs.unlinkSync(file);
    console.log('\n🗑️ Arquivos removidos com sucesso.');
  } else {
    console.log('\n⚠️ Para remover, execute novamente com:');
    console.log('   DELETE_UNUSED=true node clean-unused-components.js');
  }
}
