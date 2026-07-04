import http from 'http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { getEnv } from './config/env.js';
import { connectMongo } from './db/connect.js';
import { bootstrapAdminAndSettings, repairPendingPaymentsOnStartup, repairStudentBillingCyclesOnStartup } from './services/bootstrap.js';
import { startMonthlyBillingCron } from './cron/monthly.js';
import { startOverdueCron } from './cron/overdue.js';

async function main() {
  const env = getEnv();
  let localFallback = false;
  try {
    await connectMongo(env.MONGODB_URI);
    await bootstrapAdminAndSettings();
    await repairStudentBillingCyclesOnStartup();
    await repairPendingPaymentsOnStartup();
  } catch (e: any) {
    localFallback = true;
    // eslint-disable-next-line no-console
    console.warn(`[server] MongoDB unavailable, using local JSON fallback: ${e?.message ?? e}`);
  }

  const app = createApp({ localFallback });
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: env.APP_ORIGIN, credentials: true }
  });

  io.on('connection', (socket) => {
    socket.on('join', (room: string) => socket.join(room));
  });

  if (!localFallback) {
    startMonthlyBillingCron();
    startOverdueCron();
  }

  server.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] listening on :${env.PORT}${localFallback ? ' (local fallback mode)' : ''}`);
  });
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
