const fs = require('fs');
const path = require('path');

console.log('🔨 Organizando arquivos de build...');

// Cria estrutura dist/
const distDir = path.join(__dirname, '..', 'dist');
const distApp = path.join(distDir, 'app');

// Limpa dist se existir
if (fs.existsSync(distDir)) {
  console.log('🗑️  Limpando dist/ anterior...');
  fs.rmSync(distDir, { recursive: true, force: true });
}

// Cria dist/
fs.mkdirSync(distDir, { recursive: true });
console.log('✓ dist/ criado');

// Copia public/ para a RAIZ de dist/ (não para dist/public/)
const publicSource = path.join(__dirname, '..', 'public');
if (fs.existsSync(publicSource)) {
  // Copia cada arquivo de public/ para dist/ (raiz)
  const files = fs.readdirSync(publicSource);
  files.forEach(file => {
    const sourcePath = path.join(publicSource, file);
    const destPath = path.join(distDir, file);
    fs.cpSync(sourcePath, destPath, { recursive: true });
  });
  console.log('✓ Landing Page copiada para dist/ (raiz)');
} else {
  console.error('❌ Pasta public/ não encontrada!');
  process.exit(1);
}

// Copia app/dist/ para dist/app/
const appDist = path.join(__dirname, '..', 'app', 'dist');
if (fs.existsSync(appDist)) {
  fs.cpSync(appDist, distApp, { recursive: true });
  console.log('✓ App React copiado para dist/app/');
} else {
  console.error('❌ Build do App não encontrado em app/dist/');
  process.exit(1);
}

// Verifica se index.html do app existe
const appIndexPath = path.join(distApp, 'index.html');
if (fs.existsSync(appIndexPath)) {
  console.log('✓ App index.html validado');
} else {
  console.error('❌ app/index.html não encontrado no build!');
  process.exit(1);
}

// Verifica se index.html da LP existe na raiz
const lpIndexPath = path.join(distDir, 'index.html');
if (fs.existsSync(lpIndexPath)) {
  console.log('✓ Landing Page index.html validado (raiz)');
} else {
  console.error('❌ index.html não encontrado na raiz do dist/!');
  process.exit(1);
}

console.log('');
console.log('✅ Build organizado com sucesso!');
console.log('📁 Estrutura:');
console.log('   dist/');
console.log('   ├── index.html, quiz.html, etc  (Landing Page na raiz)');
console.log('   └── app/                       (App React)');
console.log('');
