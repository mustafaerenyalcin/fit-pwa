import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Yerel geliştirmede (npm run dev) /.netlify/functions/fit-coach isteklerini
 * doğrudan sunucu tarafında çalıştırır. API anahtarı tarayıcıya hiç çıkmaz.
 */
function netlifyFunctionDevPlugin() {
  return {
    name: 'netlify-function-dev',
    configureServer(server) {
      const env = loadEnv('development', process.cwd(), '');
      Object.assign(process.env, env);

      server.middlewares.use('/.netlify/functions/fit-coach', async (req, res) => {
        try {
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const rawBody = Buffer.concat(chunks).toString('utf8');

          const { handler } = await import('./netlify/functions/fit-coach.js');
          const result = await handler({
            httpMethod: req.method,
            headers: req.headers,
            body: rawBody
          });

          res.statusCode = result.statusCode || 200;
          if (result.headers) {
            for (const [k, v] of Object.entries(result.headers)) {
              res.setHeader(k, v);
            }
          }
          res.end(result.body || '');
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message || 'Yerel fonksiyon hatası' }));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), netlifyFunctionDevPlugin()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-icons': ['lucide-react'],
          'vendor-supabase': ['@supabase/supabase-js']
        }
      }
    }
  },
  server: {
    port: 5173,
    open: true,
    host: '0.0.0.0'
  }
});
