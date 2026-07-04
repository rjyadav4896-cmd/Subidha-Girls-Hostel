import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.js';
import { applicationsRouter } from './routes/applications.js';
import { adminRouter } from './routes/admin.js';
import { studentRouter } from './routes/student.js';
import { paymentsRouter } from './routes/payments.js';
import { getEnv } from './config/env.js';
import { createLocalFallbackRouter } from './routes/localFallback.js';

export function createApp({ localFallback = false } = {}) {
  const env = getEnv();
  const app = express();

  app.use(
    cors({
      origin: env.APP_ORIGIN,
      credentials: true
    })
  );
  app.use(cookieParser());
  app.use(
    express.json({
      limit: '20mb',
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  if (localFallback) {
    app.use('/api', createLocalFallbackRouter());
  } else {
    app.use('/api/auth', authRouter);
    app.use('/api/applications', applicationsRouter);
    app.use('/api/admin', adminRouter);
    app.use('/api/student', studentRouter);
    app.use('/api/payments', paymentsRouter);
  }

  return app;
}
