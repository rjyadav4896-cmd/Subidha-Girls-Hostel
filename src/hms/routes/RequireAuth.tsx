import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { getAdminToken, getStudentToken } from '../lib/storage';

export function RequireAdmin({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const token = getAdminToken();
  if (!token) return <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />;
  return children;
}

export function RequireStudent({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const token = getStudentToken();
  if (!token) return <Navigate to="/student/login" replace state={{ from: loc.pathname }} />;
  return children;
}

