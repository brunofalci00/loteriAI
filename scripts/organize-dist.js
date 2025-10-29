const fs = require('fs');
const path = require('path');

console.log('🔨 Organizando arquivos de build...');

// Cria estrutura dist/
const distDir = path.join(__dirname, '..', 'dist');
const distPublic = path.join(distDir, 'public');
const distApp = path.join(distDir, 'app');

// Limpa dist se existir
if (fs.existsSync(distDir)) {
  console.log('🗑️  Limpando dist/ anterior...');
  fs.rmSync(distDir, { recursive: true, force: true });
}

// Cria dist/
fs.mkdirSync(distDir, { recursive: true });
console.log('✓ dist/ criado');

// Copia public/ para dist/public/
const publicSource = path.join(__dirname, '..', 'public');
if (fs.existsSync(publicSource)) {
  fs.cpSync(publicSource, distPublic, { recursive: true });
  console.log('✓ Landing Page copiada para dist/public/');
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

// Verifica se index.html da LP existe
const lpIndexPath = path.join(distPublic, 'index.html');
if (fs.existsSync(lpIndexPath)) {
  console.log('✓ Landing Page index.html validado');
} else {
  console.error('❌ public/index.html não encontrado!');
  process.exit(1);
}

console.log('');
console.log('✅ Build organizado com sucesso!');
console.log('📁 Estrutura:');
console.log('   dist/');
console.log('   ├── public/  (Landing Page)');
console.log('   └── app/     (App React)');
console.log('');
