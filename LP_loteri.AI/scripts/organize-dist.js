const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const lpDist = path.join(__dirname, '..', 'apps', 'lp', 'dist');
const appDashboardDist = path.join(__dirname, '..', '..', 'App', 'app', 'dist');
const publicSource = path.join(__dirname, '..', 'public');

const funnels = [
  { app: 'quiz-classic', slug: 'classic', buildScript: 'build:quiz-classic' },
  { app: 'mega-quiz', slug: 'mega', buildScript: 'build:mega' },
  { app: 'lotozap-quiz', slug: 'lotozap', buildScript: 'build:lotozap' },
];
const sharedStaticFolders = ['sounds', 'video'];

const ensure = (condition, errorMessage) => {
  if (!condition) {
    console.error(errorMessage);
    process.exit(1);
  }
};

const copyDir = (source, dest) => {
  fs.cpSync(source, dest, { recursive: true });
};

const copyDirContents = (source, dest) => {
  fs.mkdirSync(dest, { recursive: true });
  fs.readdirSync(source).forEach((entry) => {
    fs.cpSync(path.join(source, entry), path.join(dest, entry), { recursive: true });
  });
};

console.log('Organizando arquivos de build...');

if (fs.existsSync(distDir)) {
  console.log('Limpando dist/ anterior...');
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });
console.log('dist/ recriado');

ensure(fs.existsSync(publicSource), 'Pasta public/ n�o encontrada na raiz!');
fs.readdirSync(publicSource).forEach((file) => {
  copyDir(path.join(publicSource, file), path.join(distDir, file));
});
console.log('Conte�do est�tico raiz copiado');

ensure(fs.existsSync(lpDist), 'Build de apps/lp n�o encontrado. Rode npm run build:lp');
copyDir(lpDist, path.join(distDir, 'lp'));
ensure(fs.existsSync(path.join(distDir, 'lp', 'index.html')), 'apps/lp/dist/index.html ausente!');
console.log('App LP copiado para dist/lp');

ensure(fs.existsSync(appDashboardDist), 'Build de App/app n�o encontrado. Rode npm run build:app');
copyDir(appDashboardDist, path.join(distDir, 'app'));
console.log('Aplica��o principal copiada para dist/app');

funnels.forEach(({ app, slug, aliasHtml, buildScript }) => {
  const source = path.join(__dirname, '..', 'apps', app, 'dist');
  const dest = path.join(distDir, 'funnels', slug);
  ensure(fs.existsSync(source), `Build de apps/${app} n�o encontrado. Rode npm run ${buildScript}`);
  copyDir(source, dest);

  const indexPath = path.join(dest, 'index.html');
  ensure(fs.existsSync(indexPath), `apps/${app}/dist/index.html ausente!`);

  if (aliasHtml) {
    fs.copyFileSync(indexPath, path.join(distDir, aliasHtml));
  }

  console.log(`Funil ${slug} copiado para dist/funnels/${slug}`);
});

sharedStaticFolders.forEach((folder) => {
  const dest = path.join(distDir, folder);
  let copied = false;

  funnels.forEach(({ app }) => {
    const source = path.join(__dirname, '..', 'apps', app, 'public', folder);
    if (fs.existsSync(source)) {
      copyDirContents(source, dest);
      copied = true;
    }
  });

  if (copied) {
    console.log(`Assets compartilhados (${folder}) copiados para dist/${folder}`);
  }
});

console.log('\nBuild organizado com sucesso!');
console.log('dist/');
console.log('  +- lp/ (app principal)');
console.log('  +- app/ (dashboard)');
console.log('  +- funnels/');
console.log('      +- classic/ (quiz acessível via /quiz)');
console.log('      +- mega/');
console.log('      +- lotozap/');
