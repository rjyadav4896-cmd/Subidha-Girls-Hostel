import { Router } from 'express';
import { z } from 'zod';
import { ApplicationModel } from '../models/Application.js';
import { getSettings } from '../services/settings.js';
import { randomToken, sha256Hex } from '../utils/crypto.js';
import { sendMail } from '../services/email.js';
import { getEnv } from '../config/env.js';
import { acceptApplicationById, rejectApplicationById } from '../services/applicationActions.js';
import { makeUsername } from '../services/ids.js';
import { encryptString } from '../utils/encrypt.js';
import { buildApplicationWhatsappUrl } from '../services/whatsapp.js';
import { createStudentReportPdf } from '../services/pdf.js';

export const applicationsRouter = Router();

const SubmitSchema = z.object({
  fullName: z.string().min(2),
  roomNumber: z.string().min(1),
  bedType: z.enum(['2-Seater', '3-Seater', '4-Seater', '5-Seater']),
  phone: z.string().regex(/^[0-9+\-\s]{7,20}$/),
  email: z.string().email(),
  school: z.string().min(2),
  address: z.string().min(2),
  guardianName: z.string().min(2),
  localGuardianName: z.string().min(2),
  collegeOrWorkTiming: z.string().min(2),
  dateOfEntry: z.string().min(1),
  passportPhotoDataUrl: z.string().regex(/^data:image\/(png|jpe?g|webp);base64,/).max(8_000_000),
  citizenshipDataUrl: z.string().regex(/^data:image\/(png|jpe?g|webp);base64,/).max(8_000_000)
});

applicationsRouter.post('/submit', async (req, res) => {
  const parsed = SubmitSchema.safeParse(req.body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const field = firstIssue?.path.join('.') || 'form';
    return res.status(400).json({ error: `${field}: ${firstIssue?.message || 'Invalid value'}` });
  }

  const dateOfEntry = new Date(parsed.data.dateOfEntry);
  if (Number.isNaN(dateOfEntry.getTime())) return res.status(400).json({ error: 'Invalid date' });

  const rawToken = randomToken(32);
  const actionTokenHash = sha256Hex(rawToken);
  const actionTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  const env = getEnv();
  const tempUsername = makeUsername(parsed.data.fullName, parsed.data.phone);
  const tempPassword = randomToken(8); // not shown to student until acceptance
  const tempPasswordEnc = encryptString(env.JWT_SECRET, tempPassword);

  const app = await ApplicationModel.create({
    ...parsed.data,
    dateOfEntry,
    tempUsername,
    tempPasswordEnc,
    actionTokenHash,
    actionTokenExpiresAt
  });

  const settings = await getSettings();
  const acceptUrl = `${env.PUBLIC_BASE_URL}/api/applications/action?token=${rawToken}&action=accept`;
  const rejectUrl = `${env.PUBLIC_BASE_URL}/api/applications/action?token=${rawToken}&action=reject`;

  const whatsappUrl = buildApplicationWhatsappUrl({
    adminPhone: env.WHATSAPP_ADMIN_PHONE,
    appOrigin: env.APP_ORIGIN,
    publicBaseUrl: env.PUBLIC_BASE_URL,
    actionToken: rawToken,
    application: app
  });

  void sendMail({
    to: settings.adminEmail,
    subject: `New Hostel Application: ${app.fullName}`,
    html: `
      <h2>New admission application</h2>
      <p><b>Name:</b> ${app.fullName}</p>
      <p><b>Email:</b> ${app.email}</p>
      <p><b>Phone:</b> ${app.phone}</p>
      <p><b>Room:</b> ${app.roomNumber}</p>
      <p><b>Bed type:</b> ${app.bedType}</p>
      <p><b>School:</b> ${app.school}</p>
      <p><b>Address:</b> ${app.address}</p>
      <p><b>Guardian:</b> ${app.guardianName}</p>
      <p><b>Local guardian:</b> ${app.localGuardianName}</p>
      <p><b>College / work timing:</b> ${app.collegeOrWorkTiming}</p>
      <p><b>Date of entry:</b> ${new Date(app.dateOfEntry).toDateString()}</p>
      <p><b>Documents:</b> Passport size photo and citizenship image submitted in the admin dashboard.</p>
      <p><b>Auto-generated username (reserved):</b> ${app.tempUsername}</p>
      <p>
        <a href="${acceptUrl}" style="padding:10px 14px;background:#16a34a;color:white;border-radius:8px;text-decoration:none;">Accept Student</a>
        &nbsp;
        <a href="${rejectUrl}" style="padding:10px 14px;background:#dc2626;color:white;border-radius:8px;text-decoration:none;">Reject</a>
      </p>
      <p>This link is one-time-use.</p>
    `
  });

  return res.json({ ok: true, whatsappUrl });
});

applicationsRouter.get('/action', async (req, res) => {
  const token = z.string().min(1).safeParse(req.query.token);
  const action = z.enum(['accept', 'reject']).safeParse(req.query.action);
  if (!token.success || !action.success) return res.status(400).send('Invalid link');

  const tokenHash = sha256Hex(token.data);
  const app = await ApplicationModel.findOne({ actionTokenHash: tokenHash }).exec();
  if (!app) return res.status(404).send('Link not found');
  if (app.actionTokenUsedAt) return res.status(410).send('Link already used');
  if (app.actionTokenExpiresAt.getTime() < Date.now()) return res.status(410).send('Link expired');
  if (app.status !== 'PENDING') return res.status(409).send('Application already processed');

  try {
    if (action.data === 'accept') {
      const accepted = await acceptApplicationById(app._id.toString());
      const reportPdfUrl = `${getEnv().PUBLIC_BASE_URL.replace(/\/$/, '')}/api/applications/report?token=${encodeURIComponent(token.data)}`;
      const adminWhatsappUrl = `https://wa.me/${getEnv().WHATSAPP_ADMIN_PHONE}?text=${encodeURIComponent(
        [
          'Subidha Girls Hostel student accepted.',
          '',
          `Name: ${app.fullName}`,
          `Username: ${accepted.username}`,
          `Temporary password: ${accepted.temporaryPassword}`,
          `PDF report: ${reportPdfUrl}`
        ].join('\n')
      )}`;
      const studentWhatsappUrl = `https://wa.me/${app.phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
        [
          `Namaste ${app.fullName}, your Subidha Girls Hostel account has been approved.`,
          '',
          `Username: ${accepted.username}`,
          `Temporary password: ${accepted.temporaryPassword}`,
          `${getEnv().APP_ORIGIN.replace(/\/$/, '')}/student/login`
        ].join('\n')
      )}`;
      return res.send(
        `<html><body style="font-family:system-ui;padding:24px;line-height:1.5"><h2>Application accepted</h2><p>The student account is active.</p><p><b>Username:</b> ${accepted.username}<br/><b>Temporary password:</b> ${accepted.temporaryPassword}</p><p><a href="${reportPdfUrl}" target="_blank">Download student PDF report</a></p><p><a href="${adminWhatsappUrl}" target="_blank">Send PDF report link to admin WhatsApp</a></p><p><a href="${studentWhatsappUrl}" target="_blank">Send login credentials to student WhatsApp</a></p></body></html>`
      );
    }
    await rejectApplicationById(app._id.toString());
    return res.send(`<html><body style="font-family:system-ui;padding:24px"><h2>Application rejected</h2><p>You can close this tab.</p></body></html>`);
  } catch (e: any) {
    return res.status(500).send('Failed to process application.');
  }
});

applicationsRouter.get('/report', async (req, res) => {
  const token = z.string().min(1).safeParse(req.query.token);
  if (!token.success) return res.status(400).send('Invalid report link');

  const tokenHash = sha256Hex(token.data);
  const app = await ApplicationModel.findOne({ actionTokenHash: tokenHash }).exec();
  if (!app) return res.status(404).send('Report not found');
  if (app.status !== 'ACCEPTED') return res.status(409).send('Report is available after acceptance.');

  const pdf = createStudentReportPdf(app.toObject() as any);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${app.fullName.replace(/[^a-z0-9]+/gi, '-')}-report.pdf"`);
  return res.send(pdf);
});
