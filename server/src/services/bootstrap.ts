import { AdminModel } from '../models/Admin.js';
import { PaymentRecordModel } from '../models/PaymentRecord.js';
import { StudentModel } from '../models/Student.js';
import { getEnv } from '../config/env.js';
import { hashPassword } from './auth.js';
import { getSettings, updateSettings } from './settings.js';
import { buildPaymentAmount, recalculatePendingPayments } from './paymentRecalculation.js';
import { getBillingAnchorDay, getFirstCycle, getNextDueDateFromEntry } from './billingCycles.js';

const ADMIN_EMAIL = 'pickyourhostel1@gmail.com';

export async function bootstrapAdminAndSettings() {
  const settings = await getSettings();

  // Ensure application confirmations go to the configured admin email.
  if (settings.adminEmail !== ADMIN_EMAIL) {
    await updateSettings({ adminEmail: ADMIN_EMAIL });
  }

  const adminCount = await AdminModel.countDocuments().exec();
  if (adminCount > 0) return;

  const env = getEnv();
  const username = env.ADMIN_BOOTSTRAP_USERNAME;
  const password = env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!username || !password) {
    // eslint-disable-next-line no-console
    console.warn('[bootstrap] No admins exist. Set ADMIN_BOOTSTRAP_USERNAME and ADMIN_BOOTSTRAP_PASSWORD to create the first admin.');
    return;
  }

  const passwordHash = await hashPassword(password);
  await AdminModel.create({ username, passwordHash, email: ADMIN_EMAIL });

  // Use the bootstrap admin email for confirmations unless already set explicitly.
  await updateSettings({ adminEmail: ADMIN_EMAIL });
}

export async function repairPendingPaymentsOnStartup() {
  const result = await recalculatePendingPayments();
  if (result.updated > 0 || result.skipped > 0) {
    // eslint-disable-next-line no-console
    console.log(`[bootstrap] pending payment recalculation checked=${result.checked} updated=${result.updated} skipped=${result.skipped}`);
  }
}

export async function repairStudentBillingCyclesOnStartup() {
  const students = await StudentModel.find({ status: 'ACTIVE' }).exec();
  let updatedStudents = 0;
  let repairedPayments = 0;

  for (const student of students) {
    const anchorDay = getBillingAnchorDay(student.toObject());
    const nextDueDate = getNextDueDateFromEntry({ dateOfEntry: student.dateOfEntry, billingAnchorDay: anchorDay });
    if (student.billingAnchorDay !== anchorDay || !student.nextDueDate || student.nextDueDate.getTime() !== nextDueDate.getTime()) {
      student.billingAnchorDay = anchorDay;
      student.nextDueDate = nextDueDate;
      // eslint-disable-next-line no-await-in-loop
      await student.save();
      updatedStudents += 1;
    }

    // Ensure the first unpaid record follows the student's entry-date cycle.
    // eslint-disable-next-line no-await-in-loop
    const firstPayment = await PaymentRecordModel.findOne({ studentId: student._id }).sort({ billingPeriodStart: 1 }).exec();
    const firstCycle = getFirstCycle({ dateOfEntry: student.dateOfEntry, billingAnchorDay: anchorDay });
    if (firstPayment && ['PENDING', 'OVERDUE', 'PARTIAL'].includes(firstPayment.status)) {
      firstPayment.billingPeriodStart = firstCycle.periodStart;
      firstPayment.billingPeriodEnd = firstCycle.periodEnd;
      firstPayment.dueDate = firstCycle.dueDate;
      // eslint-disable-next-line no-await-in-loop
      const bill = await buildPaymentAmount(student.toObject(), firstCycle.periodStart, firstCycle.periodEnd, 0);
      if (bill) {
        firstPayment.amountDue = bill.amountDue;
        firstPayment.creditCarriedOver = bill.creditApplied;
        firstPayment.leaveDeduction = bill.breakdown.leaveDiscountAmount;
        firstPayment.billingBreakdown = bill.breakdown as any;
      }
      // eslint-disable-next-line no-await-in-loop
      await firstPayment.save();
      repairedPayments += 1;
    } else if (!firstPayment) {
      // eslint-disable-next-line no-await-in-loop
      const bill = await buildPaymentAmount(student.toObject(), firstCycle.periodStart, firstCycle.periodEnd, 0);
      if (bill) {
        // eslint-disable-next-line no-await-in-loop
        await PaymentRecordModel.create({
          studentId: student._id,
          billingPeriodStart: firstCycle.periodStart,
          billingPeriodEnd: firstCycle.periodEnd,
          amountDue: bill.amountDue,
          amountPaid: 0,
          creditCarriedOver: bill.creditApplied,
          leaveDeduction: bill.breakdown.leaveDiscountAmount,
          billingBreakdown: bill.breakdown,
          dueDate: firstCycle.dueDate,
          status: 'PENDING'
        });
        repairedPayments += 1;
      }
    }
  }

  if (updatedStudents > 0 || repairedPayments > 0) {
    // eslint-disable-next-line no-console
    console.log(`[bootstrap] billing cycle repair students=${updatedStudents} payments=${repairedPayments}`);
  }
}
