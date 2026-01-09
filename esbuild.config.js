const esbuild = require('esbuild');

async function buildContent() {
  await esbuild.build({
    entryPoints: ['content/injector.ts'],
    bundle: true,
    outfile: 'dist/content/injector.js',
    format: 'iife',
    target: 'es2020',
    platform: 'browser',
    external: ['chrome'],
    sourcemap: false,
    minify: false,
  });
  console.log('✅ Content script built');
}

async function buildBackground() {
  await esbuild.build({
    entryPoints: ['background/serviceWorker.ts'],
    bundle: true,
    outfile: 'dist/background/serviceWorker.js',
    format: 'iife',
    target: 'es2020',
    platform: 'browser',
    external: ['chrome'],
    sourcemap: false,
    minify: false,
  });
  console.log('✅ Background worker built');
}

async function buildAll() {
  try {
    await Promise.all([buildContent(), buildBackground()]);
    console.log('🎉 All scripts built successfully');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  buildAll();
}

module.exports = { buildContent, buildBackground, buildAll };

