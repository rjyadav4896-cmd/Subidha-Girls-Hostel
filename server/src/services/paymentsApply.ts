import { PaymentRecordModel } from '../models/PaymentRecord.js';

export async function applyCarryOverAfterPayment(payment: any) {
  const outstanding = Math.max(payment.amountDue - payment.amountPaid, 0);
  const credit = Math.max(payment.amountPaid - payment.amountDue, 0);

  payment.creditCarriedOver = credit;
  await payment.save();

  if (credit <= 0) return;

  const next = await PaymentRecordModel.findOne({
    studentId: payment.studentId,
    billingPeriodStart: { $gt: payment.billingPeriodStart }
  })
    .sort({ billingPeriodStart: 1 })
    .exec();

  if (!next) return;
  if (!['PENDING', 'OVERDUE'].includes(next.status)) return;

  next.amountDue = Math.max(next.amountDue - credit, 0);
  next.creditCarriedOver = (next.creditCarriedOver ?? 0) + credit;
  next.billingBreakdown = {
    ...(next.billingBreakdown ?? {}),
    creditApplied: (next.billingBreakdown?.creditApplied ?? 0) + credit,
    creditRemaining: Math.max(credit - (next.billingBreakdown?.subtotal ?? next.amountDue), 0),
    totalDue: next.amountDue
  } as any;
  await next.save();

  if (outstanding > 0) {
    // Nothing to do here (outstanding is already represented by PARTIAL status on current record).
  }
}
