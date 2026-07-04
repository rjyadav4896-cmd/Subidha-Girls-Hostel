import { LeaveRecordModel } from '../models/LeaveRecord.js';
import type { Student } from '../models/Student.js';
import { getSettings } from './settings.js';
import { clampPeriodOverlapInclusive, daysInPeriodInclusive, startOfDay } from '../utils/dates.js';
import { roundRupees } from '../utils/money.js';
import { getFeeForBedType } from './pricing.js';

export type BillBreakdown = {
  bedMonthlyFee: number;
  daysInMonth: number;
  billableDays: number;
  skippedBeforeEntry: boolean;
  fullDays: number;
  leaveDays: number;
  dailyRate: number;
  leaveDayRate: number;
  fullDaysFee: number;
  leaveDaysFee: number;
  leaveDiscountAmount: number;
  total: number;
};

type BillingOptions = {
  prorateFromEntry?: boolean;
};

async function countLeaveDaysInPeriod(studentId: string, periodStart: Date, periodEnd: Date) {
  const leaves = await LeaveRecordModel.find({
    studentId,
    startDate: { $lte: periodEnd },
    endDate: { $ne: null, $gte: periodStart }
  })
    .lean()
    .exec();

  let leaveDays = 0;
  for (const leave of leaves) {
    const overlap = clampPeriodOverlapInclusive(leave.startDate, leave.endDate ?? periodEnd, periodStart, periodEnd);
    if (!overlap) continue;
    leaveDays += daysInPeriodInclusive(overlap.start, overlap.end);
  }
  return leaveDays;
}

/**
 * Billing rules:
 * - Each PaymentRecord represents one student-specific billing cycle.
 * - We compute the student's monthly fee from Settings based on bedType.
 * - By default, a billing month charges the full configured monthly fee.
 * - If prorateFromEntry is enabled, only days from dateOfEntry onward are billed.
 * - If the student has approved leave that overlaps the billing period, we discount leave days.
 * - Discount is applied as: leave day pays (dailyRate * (1 - discountRate)).
 */
export async function calculateBillForPeriod(student: Student, periodStart: Date, periodEnd: Date, options: BillingOptions = {}): Promise<BillBreakdown> {
  const settings = await getSettings();
  const bedMonthlyFee = getFeeForBedType(student.bedType, settings);

  const requestedPeriodStartDay = startOfDay(periodStart);
  const periodEndDay = startOfDay(periodEnd);
  const entryDay = startOfDay(student.dateOfEntry);
  const periodStartDay = options.prorateFromEntry
    ? new Date(Math.max(requestedPeriodStartDay.getTime(), entryDay.getTime()))
    : requestedPeriodStartDay;

  const skippedBeforeEntry = periodStartDay.getTime() > requestedPeriodStartDay.getTime();
  const totalCycleDays = periodStartDay.getTime() > periodEndDay.getTime() ? 0 : daysInPeriodInclusive(periodStartDay, periodEndDay);
  const discountRate = Math.min(Math.max(settings.leaveDiscountRate, 0), 1);
  const dailyRate = totalCycleDays > 0 ? bedMonthlyFee / totalCycleDays : 0;
  const leaveDayRate = dailyRate * (1 - discountRate);

  if (periodStartDay.getTime() > periodEndDay.getTime()) {
    return {
      bedMonthlyFee,
      billableDays: 0,
      skippedBeforeEntry,
      fullDays: 0,
      leaveDays: 0,
      daysInMonth: 0,
      dailyRate,
      leaveDayRate,
      fullDaysFee: 0,
      leaveDaysFee: 0,
      leaveDiscountAmount: 0,
      total: 0
    };
  }

  const leaveDaysRaw = await countLeaveDaysInPeriod(student._id.toString(), periodStartDay, periodEndDay);
  const totalDaysInPeriod = totalCycleDays;
  const leaveDays = Math.min(leaveDaysRaw, totalDaysInPeriod);

  const fullDays = totalDaysInPeriod - leaveDays;
  const fullDaysFee = fullDays * dailyRate;
  const leaveDaysFee = leaveDays * leaveDayRate;
  const leaveDiscountAmount = leaveDays * dailyRate * discountRate;
  const total = roundRupees(fullDaysFee + leaveDaysFee);

  return {
    bedMonthlyFee,
    billableDays: totalDaysInPeriod,
    skippedBeforeEntry,
    fullDays,
    leaveDays,
    daysInMonth: totalDaysInPeriod,
    dailyRate,
    leaveDayRate,
    fullDaysFee,
    leaveDaysFee,
    leaveDiscountAmount: roundRupees(leaveDiscountAmount),
    total
  };
}
