import { ApplicationModel } from '../models/Application.js';
import { StudentModel } from '../models/Student.js';
import { PaymentRecordModel } from '../models/PaymentRecord.js';
import { hashPassword } from './auth.js';
import { sendMail } from './email.js';
import { startOfDay } from '../utils/dates.js';
import { decryptString } from '../utils/encrypt.js';
import { getEnv } from '../config/env.js';
import { buildPaymentAmount } from './paymentRecalculation.js';
import { getFirstCycle } from './billingCycles.js';

export async function acceptApplicationById(applicationId: string) {
  const app = await ApplicationModel.findById(applicationId).exec();
  if (!app || app.status !== 'PENDING') throw new Error('Application not found');
  return acceptApplication(app);
}

export async function acceptApplication(app: any) {
  const env = getEnv();
  let username = app.tempUsername;
  const temporaryPassword = decryptString(env.JWT_SECRET, app.tempPasswordEnc);
  const passwordHash = await hashPassword(temporaryPassword);

  for (let i = 0; i < 10; i++) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await StudentModel.findOne({ username }).lean().exec();
    if (!exists) break;
    username = `${app.tempUsername}${Math.floor(Math.random() * 10)}`;
  }

  const student = await StudentModel.create({
    billingAnchorDay: startOfDay(app.dateOfEntry).getDate(),
    nextDueDate: getFirstCycle({ dateOfEntry: app.dateOfEntry, billingAnchorDay: startOfDay(app.dateOfEntry).getDate() }).dueDate,
    fullName: app.fullName,
    roomNumber: app.roomNumber,
    bedType: app.bedType,
    phone: app.phone,
    email: app.email,
    school: app.school,
    address: app.address,
    guardianName: app.guardianName,
    localGuardianName: app.localGuardianName,
    collegeOrWorkTiming: app.collegeOrWorkTiming,
    dateOfEntry: app.dateOfEntry,
    username,
    passwordHash,
    status: 'ACTIVE'
  });

  // First bill covers the student's own monthly cycle and is due one month after entry.
  const firstCycle = getFirstCycle(student.toObject());
  const bill = await buildPaymentAmount(student.toObject(), firstCycle.periodStart, firstCycle.periodEnd, 0);
  if (bill) {
    await PaymentRecordModel.create({
      studentId: student._id,
      billingPeriodStart: firstCycle.periodStart,
      billingPeriodEnd: firstCycle.periodEnd,
      amountDue: bill.amountDue,
      creditCarriedOver: bill.creditApplied,
      leaveDeduction: bill.breakdown.leaveDiscountAmount,
      billingBreakdown: bill.breakdown,
      dueDate: firstCycle.dueDate,
      status: 'PENDING'
    });
  }

  app.status = 'ACCEPTED';
  app.actionTokenUsedAt = app.actionTokenUsedAt ?? new Date();
  await app.save();

  void sendMail({
    to: student.email,
    subject: 'Welcome to the hostel — your login credentials',
    html: `
      <h2>Welcome, ${student.fullName}</h2>
      <p>Your hostel account has been approved.</p>
      <p><b>Username:</b> ${username}</p>
      <p><b>Temporary password:</b> ${temporaryPassword}</p>
      <p>Please log in and change your password after first login.</p>
    `
  });

  return { studentId: student._id.toString(), username, temporaryPassword };
}

export async function rejectApplicationById(applicationId: string) {
  const app = await ApplicationModel.findById(applicationId).exec();
  if (!app || app.status !== 'PENDING') throw new Error('Application not found');
  app.status = 'REJECTED';
  app.actionTokenUsedAt = app.actionTokenUsedAt ?? new Date();
  await app.save();
  return { ok: true };
}
