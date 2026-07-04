import cron from 'node-cron';
import { PaymentRecordModel } from '../models/PaymentRecord.js';

export function startOverdueCron() {
  cron.schedule('5 0 * * *', async () => {
    const now = new Date();
    await PaymentRecordModel.updateMany(
      { status: 'PENDING', dueDate: { $lt: now } },
      { $set: { status: 'OVERDUE' } }
    ).exec();
  });
}

