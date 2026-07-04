import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { ApplicationModel } from '../models/Application.js';
import { StudentModel } from '../models/Student.js';
import { PaymentRecordModel } from '../models/PaymentRecord.js';
import { LeaveRecordModel } from '../models/LeaveRecord.js';
import { getSettings, updateSettings } from '../services/settings.js';
import { acceptApplicationById, rejectApplicationById } from '../services/applicationActions.js';
import { applyCarryOverAfterPayment } from '../services/paymentsApply.js';
import { clampPeriodOverlapInclusive, daysInPeriodInclusive, startOfDay } from '../utils/dates.js';
import { getFeeForBedType } from '../services/pricing.js';
import { recalculatePaymentRecord, recalculatePendingPayments } from '../services/paymentRecalculation.js';
import { getEnv } from '../config/env.js';
import { buildAcceptedStudentWhatsappUrl, buildStudentCredentialsWhatsappUrl } from '../services/whatsapp.js';

export const adminRouter = Router();
adminRouter.use(requireAuth('admin'));

adminRouter.get('/applications', async (_req, res) => {
  const apps = await ApplicationModel.find({ status: 'PENDING' }).sort({ createdAt: -1 }).lean().exec();
  res.json({ applications: apps });
});

adminRouter.post('/applications/:id/accept', async (req, res) => {
  try {
    const out = await acceptApplicationById(req.params.id);
    const env = getEnv();
    const app = await ApplicationModel.findById(req.params.id).lean().exec();
    const adminWhatsappUrl = app
      ? buildAcceptedStudentWhatsappUrl({
          adminPhone: env.WHATSAPP_ADMIN_PHONE,
          appOrigin: env.APP_ORIGIN,
          student: {
            ...app,
            username: out.username,
            temporaryPassword: out.temporaryPassword
          }
        })
      : null;
    const studentWhatsappUrl = app
      ? buildStudentCredentialsWhatsappUrl({
          studentPhone: app.phone,
          appOrigin: env.APP_ORIGIN,
          student: {
            fullName: app.fullName,
            username: out.username,
            temporaryPassword: out.temporaryPassword
          }
        })
      : null;

    res.json({
      ok: true,
      studentId: out.studentId,
      username: out.username,
      temporaryPassword: out.temporaryPassword,
      adminWhatsappUrl,
      studentWhatsappUrl
    });
  } catch (e: any) {
    res.status(404).json({ error: e?.message ?? 'Not found' });
  }
});

adminRouter.post('/applications/:id/reject', async (req, res) => {
  try {
    await rejectApplicationById(req.params.id);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(404).json({ error: e?.message ?? 'Not found' });
  }
});

adminRouter.get('/students', async (_req, res) => {
  const students = await StudentModel.find({ status: 'ACTIVE' }).sort({ createdAt: -1 }).lean().exec();
  const settings = await getSettings();
  const withFees = students.map((s: any) => {
    const monthlyFee = getFeeForBedType(s.bedType, settings);
    return { ...s, monthlyFee };
  });
  const feesConfigured = Object.values(settings.fees).every((fee) => Number(fee) > 0);
  res.json({
    students: withFees,
    warning: feesConfigured ? null : 'Please configure fees in Settings before adding students.'
  });
});

adminRouter.delete('/students/:id', async (req, res) => {
  const id = req.params.id;
  const student = await StudentModel.findById(id).exec();
  if (!student) return res.status(404).json({ error: 'Not found' });
  student.status = 'INACTIVE';
  await student.save();
  res.json({ ok: true });
});

adminRouter.post('/students/:id/leave/start', async (req, res) => {
  try {
    const parsed = z.object({ startDate: z.string().min(1).optional() }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });

    const studentId = req.params.id;
    const student = await StudentModel.findById(studentId).exec();
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const existingLeave = await LeaveRecordModel.findOne({ studentId, endDate: null }).sort({ createdAt: -1 }).exec();
    if (existingLeave || student.isOnLeave) {
      return res.status(400).json({ error: 'Student is already on leave' });
    }

    const startDate = parsed.data.startDate ? new Date(parsed.data.startDate) : new Date();
    if (Number.isNaN(startDate.getTime())) return res.status(400).json({ error: 'Invalid date' });

    const leave = new LeaveRecordModel({
      studentId: student._id,
      startDate,
      endDate: null,
      totalDays: 0,
      status: 'ACTIVE'
    });
    const savedLeave = await leave.save();
    // eslint-disable-next-line no-console
    console.log('[leave] Created leave record:', savedLeave._id.toString());

    student.isOnLeave = true;
    student.currentLeaveId = savedLeave._id;
    await student.save();
    // eslint-disable-next-line no-console
    console.log('[leave] Updated student isOnLeave:', student.isOnLeave);

    const verify = await StudentModel.findById(studentId).select('isOnLeave currentLeaveId').lean().exec();
    // eslint-disable-next-line no-console
    console.log('[leave] Verification:', verify);

    return res.json({
      success: true,
      ok: true,
      message: 'Student marked on leave',
      leave: {
        id: savedLeave._id,
        startDate: savedLeave.startDate,
        status: savedLeave.status
      },
      student: {
        isOnLeave: verify?.isOnLeave ?? false,
        currentLeaveId: verify?.currentLeaveId ?? null
      }
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[leave] Start leave error:', err);
    return res.status(500).json({ error: 'Failed to mark leave', details: err?.message ?? String(err) });
  }
});

adminRouter.post('/students/:id/leave/end', async (req, res) => {
  const parsed = z.object({ endDate: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });
  const endDate = new Date(parsed.data.endDate);
  if (Number.isNaN(endDate.getTime())) return res.status(400).json({ error: 'Invalid date' });

  const student = await StudentModel.findById(req.params.id).exec();
  if (!student) return res.status(404).json({ error: 'Student not found' });

  let leave = student.currentLeaveId ? await LeaveRecordModel.findById(student.currentLeaveId).exec() : null;
  if (leave?.endDate) leave = null;
  if (!leave) {
    leave = await LeaveRecordModel.findOne({
      studentId: req.params.id,
      $or: [{ endDate: null }, { endDate: { $exists: false } }, { status: 'ACTIVE' }]
    })
      .sort({ createdAt: -1, startDate: -1 })
      .exec();
  }
  if (!leave) {
    return res.status(404).json({
      error: 'No active leave found',
      debug: {
        studentId: req.params.id,
        studentStatus: student.status,
        isOnLeave: student.isOnLeave,
        currentLeaveId: student.currentLeaveId
      }
    });
  }
  leave.endDate = endDate;
  leave.totalDays = daysInPeriodInclusive(startOfDay(leave.startDate), startOfDay(endDate));
  leave.status = 'COMPLETED';
  await leave.save();

  student.isOnLeave = false;
  student.currentLeaveId = null;
  await student.save();

  const overlappingPayments = await PaymentRecordModel.find({
    studentId: req.params.id,
    status: { $in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
    billingPeriodStart: { $lte: startOfDay(endDate) },
    billingPeriodEnd: { $gte: startOfDay(leave.startDate) }
  })
    .sort({ billingPeriodStart: 1 })
    .exec();

  const updatedPayments = [];
  for (const payment of overlappingPayments) {
    const overlap = clampPeriodOverlapInclusive(leave.startDate, endDate, payment.billingPeriodStart, payment.billingPeriodEnd);
    if (!overlap) continue;
    // eslint-disable-next-line no-await-in-loop
    const result = await recalculatePaymentRecord(payment._id.toString());
    updatedPayments.push({
      amountDue: result.payment.amountDue,
      leaveDeduction: result.payment.leaveDeduction ?? result.payment.billingBreakdown?.leaveDiscountAmount ?? 0,
      billingPeriodStart: result.payment.billingPeriodStart,
      billingPeriodEnd: result.payment.billingPeriodEnd
    });
  }

  res.json({
    success: true,
    ok: true,
    leave: { totalDays: leave.totalDays, endDate: leave.endDate },
    updatedPayment: updatedPayments[0] ?? null,
    updatedPayments
  });
});

adminRouter.get('/students/:id/leave', async (req, res) => {
  const leaves = await LeaveRecordModel.find({ studentId: req.params.id }).sort({ startDate: -1 }).lean().exec();
  res.json({ leaves });
});

adminRouter.get('/students/:id/leave/debug', async (req, res) => {
  const leaves = await LeaveRecordModel.find({ studentId: req.params.id }).sort({ createdAt: -1 }).lean().exec();
  const student = await StudentModel.findById(req.params.id).select('isOnLeave currentLeaveId status').lean().exec();
  res.json({ student, leaves });
});

adminRouter.get('/payments', async (_req, res) => {
  const payments = await PaymentRecordModel.find()
    .sort({ billingPeriodStart: -1 })
    .populate({ path: 'studentId', match: { status: 'ACTIVE' } })
    .lean()
    .exec();
  res.json({ payments: payments.filter((p: any) => !!p.studentId) });
});

adminRouter.patch('/payments/:id/mark-paid', async (req, res) => {
  const parsed = z.object({ amountPaid: z.number().min(0), reference: z.string().optional() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });

  const payment = await PaymentRecordModel.findById(req.params.id).exec();
  if (!payment) return res.status(404).json({ error: 'Not found' });

  payment.amountPaid = parsed.data.amountPaid;
  payment.status = parsed.data.amountPaid >= payment.amountDue ? 'PAID' : parsed.data.amountPaid > 0 ? 'PARTIAL' : 'PENDING';
  payment.paidAt = new Date();
  payment.referenceId = parsed.data.reference ?? payment.referenceId;
  await payment.save();
  await applyCarryOverAfterPayment(payment);
  res.json({ ok: true });
});

adminRouter.post('/payments/confirm/:paymentRecordId', async (req, res) => {
  const payment = await PaymentRecordModel.findById(req.params.paymentRecordId).exec();
  if (!payment) return res.status(404).json({ error: 'Not found' });
  if (payment.status !== 'VERIFICATION_PENDING') return res.status(409).json({ error: 'Not pending verification' });

  payment.amountPaid = payment.amountPaid > 0 ? payment.amountPaid : payment.amountDue;
  payment.status = payment.amountPaid >= payment.amountDue ? 'PAID' : payment.amountPaid > 0 ? 'PARTIAL' : 'PENDING';
  payment.paidAt = new Date();
  await payment.save();
  await applyCarryOverAfterPayment(payment);
  res.json({ ok: true });
});

adminRouter.post('/payments/reject/:paymentRecordId', async (req, res) => {
  const payment = await PaymentRecordModel.findById(req.params.paymentRecordId).exec();
  if (!payment) return res.status(404).json({ error: 'Not found' });
  payment.status = 'PENDING';
  payment.utrNumber = undefined;
  payment.amountPaid = 0;
  await payment.save();
  res.json({ ok: true });
});

adminRouter.post('/payments/:paymentRecordId/recalculate', async (req, res) => {
  try {
    const result = await recalculatePaymentRecord(req.params.paymentRecordId);
    res.json({ ok: true, updated: result.updated, skipped: result.skipped, payment: result.payment });
  } catch (e: any) {
    res.status(404).json({ error: e?.message ?? 'Not found' });
  }
});

adminRouter.post('/payments/recalculate-pending', async (_req, res) => {
  const result = await recalculatePendingPayments();
  res.json({ ok: true, ...result });
});

adminRouter.get('/settings', async (_req, res) => {
  const settings = await getSettings();
  const feesConfigured = Object.values(settings.fees).every((fee) => Number(fee) > 0);
  res.json({
    settings,
    warning: feesConfigured ? null : 'Please configure fees in Settings before adding students.'
  });
});

adminRouter.put('/settings', async (req: AuthedRequest, res) => {
  const schema = z
    .object({
      fees: z
        .object({
          twoSeater: z.number().min(0),
          threeSeater: z.number().min(0),
          fourSeater: z.number().min(0),
          fiveSeater: z.number().min(0)
        })
        .partial()
        .optional(),
      leaveDiscountRate: z.number().min(0).max(1).optional(),
      adminEmail: z.string().email().optional(),

      hostelUpiId: z.string().optional(),
      hostelDisplayName: z.string().optional(),
      paymentGateway: z.enum(['NONE', 'KHALTI']).optional(),
      staticQrImageUrl: z.string().optional(),
      autoVerifyPayments: z.boolean().optional()
    })
    .safeParse(req.body);
  if (!schema.success) return res.status(400).json({ error: 'Invalid payload' });

  const settings = await updateSettings(schema.data as any);
  res.json({ settings });
});
