import { PaymentRecordModel, type PaymentRecord } from '../models/PaymentRecord.js';
import { StudentModel, type Student } from '../models/Student.js';
import { calculateBillForPeriod } from './billing.js';
import { getSettings } from './settings.js';
import { getFeeForBedType, warnMissingFee } from './pricing.js';
import { roundRupees } from '../utils/money.js';

type RecalcOptions = {
  save?: boolean;
  explicitCredit?: number;
};

function availableCreditFromPrevious(previous: any) {
  if (!previous) return 0;
  const overpayment = Math.max((previous.amountPaid ?? 0) - (previous.amountDue ?? 0), 0);
  const remainingFromPrior = Math.max(previous.billingBreakdown?.creditRemaining ?? 0, 0);
  return roundRupees(overpayment + remainingFromPrior);
}

function isChanged(payment: PaymentRecord, nextAmountDue: number, nextBreakdown: any) {
  return (
    payment.amountDue !== nextAmountDue ||
    payment.billingBreakdown?.monthlyFee !== nextBreakdown.monthlyFee ||
    payment.billingBreakdown?.leaveDiscountAmount !== nextBreakdown.leaveDiscountAmount ||
    payment.billingBreakdown?.creditApplied !== nextBreakdown.creditApplied ||
    payment.billingBreakdown?.totalDue !== nextBreakdown.totalDue ||
    payment.leaveDeduction !== nextBreakdown.leaveDiscountAmount
  );
}

export async function buildPaymentAmount(student: Student, periodStart: Date, periodEnd: Date, explicitCredit?: number) {
  return buildPaymentAmountWithOptions(student, periodStart, periodEnd, { explicitCredit });
}

async function buildPaymentAmountWithOptions(
  student: Student,
  periodStart: Date,
  periodEnd: Date,
  options: { explicitCredit?: number } = {}
) {
  const settings = await getSettings();
  const monthlyFee = getFeeForBedType(student.bedType, settings);
  if (!monthlyFee || monthlyFee <= 0) {
    warnMissingFee(student.fullName, student.bedType);
    return null;
  }

  const bill = await calculateBillForPeriod(student, periodStart, periodEnd);
  if (bill.billableDays <= 0) {
    return null;
  }
  const creditAvailable = Math.max(options.explicitCredit ?? 0, 0);
  const creditApplied = Math.min(creditAvailable, bill.total);
  const creditRemaining = Math.max(creditAvailable - bill.total, 0);
  const amountDue = roundRupees(Math.max(bill.total - creditAvailable, 0));

  return {
    amountDue,
    creditApplied,
    creditRemaining,
    breakdown: {
      monthlyFee: bill.bedMonthlyFee,
      billableDays: bill.billableDays,
      daysInMonth: bill.daysInMonth,
      leaveDays: bill.leaveDays,
      leaveDiscountAmount: bill.leaveDiscountAmount,
      subtotal: bill.total,
      creditApplied: roundRupees(creditApplied),
      creditRemaining: roundRupees(creditRemaining),
      totalDue: amountDue
    }
  };
}

export async function recalculatePaymentRecord(paymentId: string, options: RecalcOptions = {}) {
  const payment = await PaymentRecordModel.findById(paymentId).exec();
  if (!payment) throw new Error('Payment record not found');
  const student = await StudentModel.findById(payment.studentId).exec();
  if (!student || student.status !== 'ACTIVE') return { updated: false, skipped: true, payment };

  const previous = await PaymentRecordModel.findOne({
    studentId: student._id,
    billingPeriodStart: { $lt: payment.billingPeriodStart }
  })
    .sort({ billingPeriodStart: -1 })
    .lean()
    .exec();
  const credit = options.explicitCredit ?? availableCreditFromPrevious(previous);
  const next = await buildPaymentAmountWithOptions(student.toObject(), payment.billingPeriodStart, payment.billingPeriodEnd, { explicitCredit: credit });
  if (!next) return { updated: false, skipped: true, payment };

  const changed = isChanged(payment, next.amountDue, next.breakdown);
  if (options.save !== false && changed && ['PENDING', 'OVERDUE', 'PARTIAL'].includes(payment.status)) {
    payment.amountDue = next.amountDue;
    payment.creditCarriedOver = next.creditApplied;
    payment.leaveDeduction = next.breakdown.leaveDiscountAmount;
    payment.billingBreakdown = next.breakdown as any;
    await payment.save();
  }

  return { updated: changed, skipped: false, payment };
}

export async function recalculatePendingPayments() {
  const pending = await PaymentRecordModel.find({ status: { $in: ['PENDING', 'OVERDUE', 'PARTIAL'] } }).exec();
  let updated = 0;
  let skipped = 0;
  for (const payment of pending) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const result = await recalculatePaymentRecord(payment._id.toString());
      if (result.skipped) skipped += 1;
      if (result.updated) updated += 1;
    } catch (e) {
      skipped += 1;
      // eslint-disable-next-line no-console
      console.warn('[billing] skipped pending payment recalculation', payment._id.toString(), e);
    }
  }
  return { checked: pending.length, updated, skipped };
}

export async function getCreditAvailableForNewPayment(studentId: any, periodStart: Date) {
  const previous = await PaymentRecordModel.findOne({
    studentId,
    billingPeriodStart: { $lt: periodStart }
  })
    .sort({ billingPeriodStart: -1 })
    .lean()
    .exec();
  return availableCreditFromPrevious(previous);
}
