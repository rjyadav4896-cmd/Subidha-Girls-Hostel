import cron from 'node-cron';
import { StudentModel } from '../models/Student.js';
import { PaymentRecordModel } from '../models/PaymentRecord.js';
import { sameDayWindow } from '../utils/dates.js';
import { buildPaymentAmount, getCreditAvailableForNewPayment } from '../services/paymentRecalculation.js';
import { getNextCycleFromDueDate } from '../services/billingCycles.js';

export function startMonthlyBillingCron() {
  // Runs daily at 00:00 and bills only students whose personal cycle starts today.
  cron.schedule('0 0 * * *', async () => {
    const { start: today, end: tomorrow } = sameDayWindow(new Date());

    const students = await StudentModel.find({
      status: 'ACTIVE',
      nextDueDate: { $gte: today, $lt: tomorrow }
    }).exec();
    for (const student of students) {
      try {
        const cycle = getNextCycleFromDueDate(student.toObject(), student.nextDueDate ?? today);

        // eslint-disable-next-line no-await-in-loop
        const existing = await PaymentRecordModel.findOne({
          studentId: student._id,
          billingPeriodStart: cycle.periodStart
        })
          .lean()
          .exec();
        if (existing) {
          student.billingAnchorDay = cycle.anchorDay;
          student.nextDueDate = cycle.dueDate;
          // eslint-disable-next-line no-await-in-loop
          await student.save();
          continue;
        }

        // eslint-disable-next-line no-await-in-loop
        const credit = await getCreditAvailableForNewPayment(student._id, cycle.periodStart);
        // eslint-disable-next-line no-await-in-loop
        const bill = await buildPaymentAmount(student.toObject(), cycle.periodStart, cycle.periodEnd, credit);
        if (!bill) continue;

        // eslint-disable-next-line no-await-in-loop
        await PaymentRecordModel.create({
          studentId: student._id,
          billingPeriodStart: cycle.periodStart,
          billingPeriodEnd: cycle.periodEnd,
          amountDue: bill.amountDue,
          creditCarriedOver: bill.creditApplied,
          leaveDeduction: bill.breakdown.leaveDiscountAmount,
          billingBreakdown: bill.breakdown,
          dueDate: cycle.dueDate,
          status: 'PENDING'
        });

        student.billingAnchorDay = cycle.anchorDay;
        student.nextDueDate = cycle.dueDate;
        // eslint-disable-next-line no-await-in-loop
        await student.save();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[cron] failed to generate bill', student._id.toString(), e);
      }
    }
  });
}
