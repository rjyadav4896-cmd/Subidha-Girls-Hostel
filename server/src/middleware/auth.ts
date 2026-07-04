import type { NextFunction, Request, Response } from 'express';
import { verifyJwt, type JwtRole } from '../services/auth.js';

function getBearerToken(req: Request) {
  const hdr = req.headers.authorization;
  if (!hdr) return null;
  const [kind, token] = hdr.split(' ');
  if (kind !== 'Bearer' || !token) return null;
  return token;
}

export type AuthedRequest = Request & { auth?: { sub: string; role: JwtRole } };

export function requireAuth(role: JwtRole) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      const token = getBearerToken(req) ?? (req.cookies?.token as string | undefined) ?? null;
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      const decoded = verifyJwt(token);
      if (decoded.role !== role) return res.status(403).json({ error: 'Forbidden' });
      req.auth = { sub: decoded.sub, role: decoded.role };
      next();
    } catch {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
}

