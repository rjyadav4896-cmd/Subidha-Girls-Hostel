import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { AdminModel } from '../models/Admin.js';
import { StudentModel } from '../models/Student.js';
import { signJwt, verifyPassword } from '../services/auth.js';
import { getEnv } from '../config/env.js';

export const authRouter = Router();

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 8;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function normalizeUsername(username: string) {
  return username.trim();
}

function getCookieOptions() {
  const env = getEnv();
  const production = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    sameSite: production ? ('none' as const) : ('lax' as const),
    secure: production,
    path: '/',
    maxAge: env.AUTH_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000
  };
}

function rateLimitKey(req: Request, role: string, username: string) {
  return `${role}:${req.ip}:${username.toLowerCase()}`;
}

function isRateLimited(key: string) {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry || entry.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_LOGIN_ATTEMPTS;
}

function clearRateLimit(key: string) {
  loginAttempts.delete(key);
}

function invalidCredentials(res: Response) {
  return res.status(401).json({ error: 'Invalid username or password.' });
}

authRouter.post('/student/login', async (req, res) => {
  const body = z
    .object({
      username: z.string().trim().min(1),
      password: z.string().min(1)
    })
    .safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: 'Please enter your username and password.' });

  const username = normalizeUsername(body.data.username);
  const limitKey = rateLimitKey(req, 'student', username);
  if (isRateLimited(limitKey)) return res.status(429).json({ error: 'Too many login attempts. Please wait 15 minutes and try again.' });

  const student = await StudentModel.findOne({ username, status: 'ACTIVE' }).exec();
  if (!student || !student.passwordHash) return invalidCredentials(res);

  const ok = await verifyPassword(body.data.password, student.passwordHash);
  if (!ok) return invalidCredentials(res);

  clearRateLimit(limitKey);
  const token = signJwt({ sub: student._id.toString(), role: 'student' });
  res.cookie('token', token, getCookieOptions());
  return res.json({
    token,
    user: {
      role: 'student',
      username: student.username,
      name: student.fullName
    }
  });
});

authRouter.post('/admin/login', async (req, res) => {
  const body = z
    .object({
      username: z.string().trim().min(1),
      password: z.string().min(1)
    })
    .safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: 'Please enter your username and password.' });

  const username = normalizeUsername(body.data.username);
  const limitKey = rateLimitKey(req, 'admin', username);
  if (isRateLimited(limitKey)) return res.status(429).json({ error: 'Too many login attempts. Please wait 15 minutes and try again.' });

  const admin = await AdminModel.findOne({ username }).exec();
  if (!admin) return invalidCredentials(res);

  const ok = await verifyPassword(body.data.password, admin.passwordHash);
  if (!ok) return invalidCredentials(res);

  clearRateLimit(limitKey);
  const token = signJwt({ sub: admin._id.toString(), role: 'admin' });
  res.cookie('token', token, getCookieOptions());
  return res.json({
    token,
    user: {
      role: 'admin',
      username: admin.username,
      name: admin.email ?? admin.username
    }
  });
});

authRouter.post('/logout', (_req, res) => {
  res.clearCookie('token', { ...getCookieOptions(), maxAge: undefined });
  return res.status(204).send();
});
