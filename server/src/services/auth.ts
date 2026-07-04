import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getEnv } from '../config/env.js';

export type JwtRole = 'admin' | 'student';

export function signJwt(payload: { sub: string; role: JwtRole }) {
  const env = getEnv();
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '30d' });
}

export function verifyJwt(token: string) {
  const env = getEnv();
  return jwt.verify(token, env.JWT_SECRET) as { sub: string; role: JwtRole; iat: number; exp: number };
}

export async function hashPassword(password: string) {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

