import { Router } from 'express';
import { z } from 'zod';
import { PaymentRecordModel } from '../models/PaymentRecord.js';
import { StudentModel } from '../models/Student.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { getSettings } from '../services/settings.js';
import { sendMail } from '../services/email.js';
import { getEnv } from '../config/env.js';
import { khaltiInitiate, khaltiLookup } from '../services/khalti.js';
import { applyCarryOverAfterPayment } from '../services/paymentsApply.js';

export const paymentsRouter = Router();

paymentsRouter.post('/initiate/:paymentRecordId', requireAuth('student'), async (req: AuthedRequest, res) => {
  const payment = await PaymentRecordModel.findById(req.params.paymentRecordId).exec();
  if (!payment) return res.status(404).json({ error: 'Not found' });
  if (payment.studentId.toString() !== req.auth!.sub) return res.status(403).json({ error: 'Forbidden' });

  const settings = await getSettings();
  const remaining = Math.max(payment.amountDue - payment.amountPaid, 0);
  const billingKey = new Date(payment.billingPeriodStart).toISOString().slice(0, 7);
  const purchaseOrderId = `HOSTEL-${payment.studentId.toString()}-${billingKey}`;
  payment.referenceId = purchaseOrderId;
  await payment.save();

  const env = getEnv();
  const returnUrl = env.PAYMENT_RETURN_URL ?? `${env.APP_ORIGIN}/payment/verify`;

  let khalti: { pidx: string; payment_url: string } | null = null;
  if (settings.paymentGateway === 'KHALTI' && remaining > 0) {
    const student = await StudentModel.findById(payment.studentId).lean().exec();
    if (student) {
      khalti = await khaltiInitiate({
        returnUrl,
        websiteUrl: env.APP_ORIGIN,
        amountInPaisa: Math.round(remaining * 100),
        purchaseOrderId,
        purchaseOrderName: `Hostel Fee - ${student.fullName} - ${billingKey}`,
        customer: { name: student.fullName, email: student.email, phone: student.phone }
      });
      payment.gateway = 'KHALTI';
      payment.gatewayPaymentId = khalti.pidx;
      await payment.save();
    }
  }

  res.json({
    reference_id: purchaseOrderId,
    amount: remaining,
    gateway: settings.paymentGateway,
    khalti,
    static_qr_image_url: settings.staticQrImageUrl ?? ''
  });
});

paymentsRouter.get('/verify', async (req, res) => {
  const pidx = z.string().min(1).safeParse(req.query.pidx);
  if (!pidx.success) return res.status(400).json({ error: 'Missing pidx' });

  const payment = await PaymentRecordModel.findOne({ gateway: 'KHALTI', gatewayPaymentId: pidx.data }).exec();
  if (!payment) return res.status(404).json({ error: 'Payment record not found' });

  try {
    const lookup = await khaltiLookup(pidx.data);
    payment.gatewayPayload = lookup;
    if (lookup.status === 'Completed') {
      payment.amountPaid = lookup.total_amount / 100;
      payment.status = payment.amountPaid >= payment.amountDue ? 'PAID' : payment.amountPaid > 0 ? 'PARTIAL' : 'PENDING';
      payment.paidAt = new Date();
      await payment.save();
      await applyCarryOverAfterPayment(payment);
    } else {
      await payment.save();
    }
    return res.json({ ok: true, status: lookup.status, paymentStatus: payment.status, amountPaid: payment.amountPaid });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? 'Verification failed' });
  }
});

paymentsRouter.post('/submit-utr/:paymentRecordId', requireAuth('student'), async (req: AuthedRequest, res) => {
  const body = z.object({ utr_number: z.string().regex(/^[0-9A-Za-z]{10,40}$/) }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: 'Invalid transaction ID' });

  const payment = await PaymentRecordModel.findById(req.params.paymentRecordId).exec();
  if (!payment) return res.status(404).json({ error: 'Not found' });
  if (payment.studentId.toString() !== req.auth!.sub) return res.status(403).json({ error: 'Forbidden' });

  const existing = await PaymentRecordModel.findOne({ utrNumber: body.data.utr_number }).lean().exec();
  if (existing) return res.status(409).json({ error: 'Transaction ID already used' });

  const student = await StudentModel.findById(payment.studentId).lean().exec();
  const settings = await getSettings();

  payment.utrNumber = body.data.utr_number;
  payment.status = 'VERIFICATION_PENDING';
  await payment.save();

  await sendMail({
    to: settings.adminEmail,
    subject: `Payment verification pending: ${student?.fullName ?? 'Student'}`,
    html: `
      <h3>Payment verification pending</h3>
      <p><b>Student:</b> ${student?.fullName ?? ''}</p>
      <p><b>Amount due:</b> ₹${payment.amountDue}</p>
      <p><b>Transaction ID:</b> ${payment.utrNumber}</p>
      <p>Verify this payment in the admin dashboard.</p>
    `
  });

  res.json({ status: 'VERIFICATION_PENDING' });
});

paymentsRouter.get('/status/:paymentRecordId', requireAuth('student'), async (req: AuthedRequest, res) => {
  const payment = await PaymentRecordModel.findById(req.params.paymentRecordId).lean().exec();
  if (!payment) return res.status(404).json({ error: 'Not found' });
  if (payment.studentId.toString() !== req.auth!.sub) return res.status(403).json({ error: 'Forbidden' });
  res.json({
    status: payment.status,
    amountPaid: payment.amountPaid,
    paidAt: payment.paidAt,
    credit: payment.creditCarriedOver,
    utrNumber: payment.utrNumber,
    referenceId: payment.referenceId,
    gateway: payment.gateway
  });
});

