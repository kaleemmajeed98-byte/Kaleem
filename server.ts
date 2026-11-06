import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { authMiddleware } from './server/middleware/auth.js';
import { authRouter } from './server/routes/auth.routes.js';
import { tenantRouter } from './server/routes/tenant.routes.js';
import { branchRouter } from './server/routes/branch.routes.js';
import { userRouter } from './server/routes/user.routes.js';
import { auditRouter } from './server/routes/audit.routes.js';
import { orderRouter } from './server/routes/order.routes.js';
import { menuRouter } from './server/routes/menu.routes.js';
import { shiftRouter } from './server/routes/shift.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());
  app.use(authMiddleware);

  // Health probe
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'UP',
      architecture: 'EROS Enterprise RMS',
      timestamp: new Date().toISOString(),
    });
  });

  // REST API Routes
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/tenants', tenantRouter);
  app.use('/api/v1/branches', branchRouter);
  app.use('/api/v1/users', userRouter);
  app.use('/api/v1/audit-logs', auditRouter);
  app.use('/api/v1/orders', orderRouter);
  app.use('/api/v1/menu', menuRouter);
  app.use('/api/v1/shifts', shiftRouter);

  // Mount Vite development middlewares or serve production dist
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[EROS Enterprise] Server running on http://0.0.0.0:${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('[EROS Enterprise] Failed to start server:', err);
  process.exit(1);
});
