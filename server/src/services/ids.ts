export function makeUsername(fullName: string, phone: string) {
  const parts = fullName.trim().split(/\s+/);
  const first = (parts[0] ?? 'student').toLowerCase();
  const last4 = phone.replace(/\D/g, '').slice(-4) || '0000';
  return `${first}${last4}`;
}

export function makeReferenceId(prefix: string, studentId: string, billingKey: string) {
  const ts = Date.now();
  return `${prefix}-${studentId}-${billingKey}-${ts}`;
}

