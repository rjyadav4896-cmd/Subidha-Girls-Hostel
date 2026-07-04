import type { Student } from '../models/Student.js';
import { addMonthsClamped, dayBefore, startOfDay } from '../utils/dates.js';

export function getBillingAnchorDay(student: Pick<Student, 'dateOfEntry' | 'billingAnchorDay'>) {
  return student.billingAnchorDay ?? startOfDay(student.dateOfEntry).getDate();
}

export function getFirstCycle(student: Pick<Student, 'dateOfEntry' | 'billingAnchorDay'>) {
  const periodStart = startOfDay(student.dateOfEntry);
  const anchorDay = getBillingAnchorDay(student);
  const dueDate = addMonthsClamped(periodStart, 1, anchorDay);
  return { periodStart, periodEnd: dayBefore(dueDate), dueDate, anchorDay };
}

export function getNextCycleFromDueDate(student: Pick<Student, 'dateOfEntry' | 'billingAnchorDay'>, dueDate: Date) {
  const periodStart = startOfDay(dueDate);
  const anchorDay = getBillingAnchorDay(student);
  const nextDueDate = addMonthsClamped(periodStart, 1, anchorDay);
  return { periodStart, periodEnd: dayBefore(nextDueDate), dueDate: nextDueDate, anchorDay };
}

export function getNextDueDateFromEntry(student: Pick<Student, 'dateOfEntry' | 'billingAnchorDay'>, fromDate = new Date()) {
  const anchorDay = getBillingAnchorDay(student);
  let nextDueDate = addMonthsClamped(student.dateOfEntry, 1, anchorDay);
  const today = startOfDay(fromDate);
  while (nextDueDate.getTime() < today.getTime()) {
    nextDueDate = addMonthsClamped(nextDueDate, 1, anchorDay);
  }
  return nextDueDate;
}
