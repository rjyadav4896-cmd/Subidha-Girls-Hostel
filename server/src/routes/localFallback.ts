import { Router } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import { z } from 'zod';
import { getEnv } from '../config/env.js';
import { hashPassword, signJwt, verifyPassword } from '../services/auth.js';
import { buildAcceptedStudentWhatsappUrl, buildApplicationWhatsappUrl, buildStudentCredentialsWhatsappUrl } from '../services/whatsapp.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { createStudentReportPdf } from '../services/pdf.js';

type LocalApplication = {
  _id: string;
  fullName: string;
  roomNumber: string;
  bedType: '2-Seater' | '3-Seater' | '4-Seater' | '5-Seater';
  phone: string;
  email: string;
  school: string;
  address: string;
  guardianName: string;
  localGuardianName: string;
  collegeOrWorkTiming: string;
  dateOfEntry: string;
  passportPhotoDataUrl: string;
  citizenshipDataUrl: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  tempUsername: string;
  tempPassword: string;
  actionToken: string;
  createdAt: string;
};

type LocalStudent = Omit<LocalApplication, 'status' | 'tempUsername' | 'tempPassword' | 'actionToken'> & {
  username: string;
  passwordHash: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
};

type LocalAdmin = {
  _id: string;
  username: string;
  email: string;
  passwordHash: string;
};

type LocalDb = {
  admins: LocalAdmin[];
  applications: LocalApplication[];
  students: LocalStudent[];
};

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

const dbPath = path.resolve(process.cwd(), '.local-data', 'hms.json');

function id() {
  return randomBytes(12).toString('hex');
}

function makeUsername(fullName: string, phone: string) {
  const base = fullName.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 12) || 'student';
  const suffix = phone.replace(/\D/g, '').slice(-4) || randomBytes(2).toString('hex');
  return `${base}${suffix}`;
}

async function readDb(): Promise<LocalDb> {
  try {
    const raw = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(raw) as LocalDb;
  } catch {
    const env = getEnv();
    const db: LocalDb = {
      admins: [
        {
          _id: id(),
          username: env.ADMIN_BOOTSTRAP_USERNAME,
          email: 'pickyourhostel1@gmail.com',
          passwordHash: await hashPassword(env.ADMIN_BOOTSTRAP_PASSWORD)
        }
      ],
      applications: [],
      students: []
    };
    await writeDb(db);
    return db;
  }
}

async function writeDb(db: LocalDb) {
  await fs.mkdir(path.dirname(dbPath), { recursive: true });
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8');
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: getEnv().AUTH_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000
  };
}

function asWhatsappApplication(app: LocalApplication) {
  return { ...app, dateOfEntry: new Date(app.dateOfEntry) };
}

export function createLocalFallbackRouter() {
  const router = Router();

  router.post('/auth/admin/login', async (req, res) => {
    const body = z.object({ username: z.string().min(1), password: z.string().min(1) }).safeParse(req.body);
    if (!body.success) return res.status(400).json({ error: 'Please enter your username and password.' });

    const db = await readDb();
    const admin = db.admins.find((a) => a.username === body.data.username.trim());
    if (!admin || !(await verifyPassword(body.data.password, admin.passwordHash))) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = signJwt({ sub: admin._id, role: 'admin' });
    res.cookie('token', token, cookieOptions());
    return res.json({ token, user: { role: 'admin', username: admin.username, name: admin.email } });
  });

  router.post('/auth/student/login', async (req, res) => {
    const body = z.object({ username: z.string().min(1), password: z.string().min(1) }).safeParse(req.body);
    if (!body.success) return res.status(400).json({ error: 'Please enter your username and password.' });

    const db = await readDb();
    const student = db.students.find((s) => s.username === body.data.username.trim() && s.status === 'ACTIVE');
    if (!student || !(await verifyPassword(body.data.password, student.passwordHash))) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = signJwt({ sub: student._id, role: 'student' });
    res.cookie('token', token, cookieOptions());
    return res.json({ token, user: { role: 'student', username: student.username, name: student.fullName } });
  });

  router.post('/auth/logout', (_req, res) => {
    res.clearCookie('token', { ...cookieOptions(), maxAge: undefined });
    return res.status(204).send();
  });

  router.post('/applications/submit', async (req, res) => {
    const parsed = SubmitSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return res.status(400).json({ error: `${firstIssue?.path.join('.') || 'form'}: ${firstIssue?.message || 'Invalid value'}` });
    }

    const entry = new Date(parsed.data.dateOfEntry);
    if (Number.isNaN(entry.getTime())) return res.status(400).json({ error: 'Invalid date' });

    const db = await readDb();
    let username = makeUsername(parsed.data.fullName, parsed.data.phone);
    while (db.students.some((s) => s.username === username) || db.applications.some((a) => a.tempUsername === username)) {
      username = `${username}${Math.floor(Math.random() * 10)}`;
    }

    const app: LocalApplication = {
      _id: id(),
      fullName: parsed.data.fullName,
      roomNumber: parsed.data.roomNumber,
      bedType: parsed.data.bedType,
      phone: parsed.data.phone,
      email: parsed.data.email,
      school: parsed.data.school,
      address: parsed.data.address,
      guardianName: parsed.data.guardianName,
      localGuardianName: parsed.data.localGuardianName,
      collegeOrWorkTiming: parsed.data.collegeOrWorkTiming,
      dateOfEntry: parsed.data.dateOfEntry,
      passportPhotoDataUrl: parsed.data.passportPhotoDataUrl,
      citizenshipDataUrl: parsed.data.citizenshipDataUrl,
      status: 'PENDING',
      tempUsername: username,
      tempPassword: randomBytes(4).toString('hex'),
      actionToken: randomBytes(24).toString('hex'),
      createdAt: new Date().toISOString()
    };
    db.applications.unshift(app);
    await writeDb(db);

    const env = getEnv();
    const whatsappUrl = buildApplicationWhatsappUrl({
      adminPhone: env.WHATSAPP_ADMIN_PHONE,
      appOrigin: env.APP_ORIGIN,
      publicBaseUrl: env.PUBLIC_BASE_URL,
      actionToken: app.actionToken,
      application: asWhatsappApplication(app)
    });

    return res.json({ ok: true, whatsappUrl });
  });

  router.get('/applications/action', async (req, res) => {
    const token = z.string().min(1).safeParse(req.query.token);
    const action = z.enum(['accept', 'reject']).safeParse(req.query.action);
    if (!token.success || !action.success) return res.status(400).send('Invalid link');

    const db = await readDb();
    const app = db.applications.find((a) => a.actionToken === token.data);
    if (!app) return res.status(404).send('Link not found');
    if (app.status !== 'PENDING') return res.status(409).send('Application already processed');

    if (action.data === 'reject') {
      app.status = 'REJECTED';
      await writeDb(db);
      return res.send(`<html><body style="font-family:system-ui;padding:24px"><h2>Application rejected</h2><p>You can close this tab.</p></body></html>`);
    }

    const passwordHash = await hashPassword(app.tempPassword);
    const student: LocalStudent = {
      _id: id(),
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
      passportPhotoDataUrl: app.passportPhotoDataUrl,
      citizenshipDataUrl: app.citizenshipDataUrl,
      username: app.tempUsername,
      passwordHash,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };
    app.status = 'ACCEPTED';
    db.students.unshift(student);
    await writeDb(db);

    const env = getEnv();
    const reportPdfUrl = `${env.PUBLIC_BASE_URL.replace(/\/$/, '')}/api/applications/report?token=${encodeURIComponent(app.actionToken)}`;
    const reportStudent = { ...asWhatsappApplication(app), username: student.username, temporaryPassword: app.tempPassword };
    const adminWhatsappUrl = buildAcceptedStudentWhatsappUrl({
      adminPhone: env.WHATSAPP_ADMIN_PHONE,
      appOrigin: env.APP_ORIGIN,
      reportPdfUrl,
      student: reportStudent
    });
    const studentWhatsappUrl = buildStudentCredentialsWhatsappUrl({
      studentPhone: student.phone,
      appOrigin: env.APP_ORIGIN,
      student: { fullName: student.fullName, username: student.username, temporaryPassword: app.tempPassword }
    });

    return res.send(
      `<html><body style="font-family:system-ui;padding:24px;line-height:1.5"><h2>Application accepted</h2><p>The student account is active.</p><p><b>Username:</b> ${student.username}<br/><b>Temporary password:</b> ${app.tempPassword}</p><p><a href="${reportPdfUrl}" target="_blank">Download student PDF report</a></p><p><a href="${adminWhatsappUrl}" target="_blank">Send PDF report link to admin WhatsApp</a></p><p><a href="${studentWhatsappUrl}" target="_blank">Send login credentials to student WhatsApp</a></p></body></html>`
    );
  });

  router.get('/applications/report', async (req, res) => {
    const token = z.string().min(1).safeParse(req.query.token);
    if (!token.success) return res.status(400).send('Invalid report link');

    const db = await readDb();
    const app = db.applications.find((a) => a.actionToken === token.data);
    if (!app) return res.status(404).send('Report not found');
    if (app.status !== 'ACCEPTED') return res.status(409).send('Report is available after acceptance.');

    const pdf = createStudentReportPdf(app);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${app.fullName.replace(/[^a-z0-9]+/gi, '-')}-report.pdf"`);
    return res.send(pdf);
  });

  router.get('/admin/applications', requireAuth('admin'), async (_req, res) => {
    const db = await readDb();
    return res.json({ applications: db.applications.filter((a) => a.status === 'PENDING') });
  });

  router.post('/admin/applications/:id/accept', requireAuth('admin'), async (req, res) => {
    const db = await readDb();
    const app = db.applications.find((a) => a._id === req.params.id && a.status === 'PENDING');
    if (!app) return res.status(404).json({ error: 'Application not found' });

    const passwordHash = await hashPassword(app.tempPassword);
    const student: LocalStudent = {
      _id: id(),
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
      passportPhotoDataUrl: app.passportPhotoDataUrl,
      citizenshipDataUrl: app.citizenshipDataUrl,
      username: app.tempUsername,
      passwordHash,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };
    app.status = 'ACCEPTED';
    db.students.unshift(student);
    await writeDb(db);

    const env = getEnv();
    const reportStudent = { ...asWhatsappApplication(app), username: student.username, temporaryPassword: app.tempPassword };
    return res.json({
      ok: true,
      studentId: student._id,
      username: student.username,
      temporaryPassword: app.tempPassword,
      adminWhatsappUrl: buildAcceptedStudentWhatsappUrl({ adminPhone: env.WHATSAPP_ADMIN_PHONE, appOrigin: env.APP_ORIGIN, student: reportStudent }),
      studentWhatsappUrl: buildStudentCredentialsWhatsappUrl({
        studentPhone: student.phone,
        appOrigin: env.APP_ORIGIN,
        student: { fullName: student.fullName, username: student.username, temporaryPassword: app.tempPassword }
      })
    });
  });

  router.post('/admin/applications/:id/reject', requireAuth('admin'), async (req, res) => {
    const db = await readDb();
    const app = db.applications.find((a) => a._id === req.params.id && a.status === 'PENDING');
    if (!app) return res.status(404).json({ error: 'Application not found' });
    app.status = 'REJECTED';
    await writeDb(db);
    return res.json({ ok: true });
  });

  router.get('/admin/students', requireAuth('admin'), async (_req, res) => {
    const db = await readDb();
    return res.json({ students: db.students.filter((s) => s.status === 'ACTIVE').map((s) => ({ ...s, monthlyFee: 0 })), warning: null });
  });

  router.get('/student/dashboard', requireAuth('student'), async (req: AuthedRequest, res) => {
    const db = await readDb();
    const student = db.students.find((s) => s._id === req.auth!.sub && s.status === 'ACTIVE');
    if (!student) return res.status(404).json({ error: 'Not found' });
    return res.json({
      student: { ...student, monthlyFee: 0, billingAnchorDay: new Date(student.dateOfEntry).getDate() },
      currentPayment: null,
      nextPayment: null,
      payments: [],
      leaves: [],
      settings: {}
    });
  });

  router.use((_req, res) => res.status(404).json({ error: 'This feature needs MongoDB. Admission, approval, and login are available in local fallback mode.' }));

  return router;
}
