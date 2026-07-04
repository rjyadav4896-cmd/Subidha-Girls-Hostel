import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { StudentModel } from '../models/Student.js';
import { PaymentRecordModel } from '../models/PaymentRecord.js';
import { LeaveRecordModel } from '../models/LeaveRecord.js';
import { getSettings } from '../services/settings.js';
import { monthlyFeeForBedType } from '../services/pricing.js';

export const studentRouter = Router();
studentRouter.use(requireAuth('student'));

studentRouter.get('/dashboard', async (req: AuthedRequest, res) => {
  const studentId = req.auth!.sub;
  const student = await StudentModel.findById(studentId).lean().exec();
  if (!student) return res.status(404).json({ error: 'Not found' });

  const now = new Date();
  const payments = await PaymentRecordModel.find({ studentId }).sort({ billingPeriodStart: -1 }).lean().exec();
  const leaves = await LeaveRecordModel.find({ studentId }).sort({ startDate: -1 }).lean().exec();
  const settings = await getSettings();
  const monthlyFee = await monthlyFeeForBedType(student.bedType as any);

  const current = payments.find((p) => new Date(p.billingPeriodStart) <= now && now <= new Date(p.billingPeriodEnd)) ?? payments[0] ?? null;
  const next = payments.find((p) => new Date(p.billingPeriodStart) > now) ?? null;

  res.json({ student: { ...student, monthlyFee }, currentPayment: current, nextPayment: next, payments, leaves, settings });
});
