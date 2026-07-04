import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { formatDateDDMMYYYY, formatINR, formatOrdinalDay } from '../../lib/format';

type Payment = any;

export function AdminPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ payments: Payment[] }>('/api/admin/payments', { role: 'admin' });
      setPayments(res.payments);
    } catch (e: any) {
      setError(e?.message ?? 'Failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === 'ALL') return payments;
    return payments.filter((p) => p.status === statusFilter);
  }, [payments, statusFilter]);

  async function confirm(id: string) {
    await apiFetch(`/api/admin/payments/confirm/${id}`, { method: 'POST', role: 'admin' });
    await load();
  }

  async function reject(id: string) {
    await apiFetch(`/api/admin/payments/reject/${id}`, { method: 'POST', role: 'admin' });
    await load();
  }

  async function recalculate(id: string) {
    await apiFetch(`/api/admin/payments/${id}/recalculate`, { method: 'POST', role: 'admin' });
    await load();
  }

  return (
    <Card
      title="Payments"
      right={
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary"
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="OVERDUE">Overdue</option>
            <option value="PARTIAL">Partial</option>
            <option value="PAID">Paid</option>
            <option value="VERIFICATION_PENDING">Verification Pending</option>
          </select>
          <Button variant="ghost" onClick={load} disabled={loading}>
            Refresh
          </Button>
        </div>
      }
    >
      {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-3">{error}</div>}
      {loading ? (
        <div className="text-slate-600 text-sm">Loading...</div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-[1500px] w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="py-2">Student</th>
                <th className="py-2">Anchor</th>
                <th className="py-2">Next Due</th>
                <th className="py-2">Period</th>
                <th className="py-2">Leave</th>
                <th className="py-2">Deduction</th>
                <th className="py-2">Final Due</th>
                <th className="py-2">Paid</th>
                <th className="py-2">UTR/Ref</th>
                <th className="py-2">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id} className="border-t border-slate-100">
                  <td className="py-3">
                    <div className="font-semibold text-slate-900">{p.studentId?.fullName ?? '-'}</div>
                    <div className="text-xs text-slate-500">{p.studentId?.roomNumber ?? ''}</div>
                  </td>
                  <td className="py-3">{formatOrdinalDay(p.studentId?.billingAnchorDay)}</td>
                  <td className="py-3">{formatDateDDMMYYYY(p.studentId?.nextDueDate ?? p.dueDate)}</td>
                  <td className="py-3">
                    {formatDateDDMMYYYY(p.billingPeriodStart)} - {formatDateDDMMYYYY(p.billingPeriodEnd)}
                  </td>
                  <td className="py-3">{p.billingBreakdown?.leaveDays ?? 0} days</td>
                  <td className="py-3">-{formatINR(p.leaveDeduction ?? p.billingBreakdown?.leaveDiscountAmount ?? 0)}</td>
                  <td className="py-3">{formatINR(p.amountDue)}</td>
                  <td className="py-3">{formatINR(p.amountPaid)}</td>
                  <td className="py-3">{p.utrNumber ?? p.referenceId ?? '-'}</td>
                  <td className="py-3">{p.status}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      {(p.status === 'PENDING' || p.status === 'OVERDUE' || p.status === 'PARTIAL') && (
                        <Button variant="ghost" onClick={() => recalculate(p._id)}>
                          Recalculate
                        </Button>
                      )}
                      {p.status === 'VERIFICATION_PENDING' ? (
                        <>
                          <Button variant="secondary" onClick={() => confirm(p._id)}>
                            Confirm
                          </Button>
                          <Button variant="danger" onClick={() => reject(p._id)}>
                            Reject
                          </Button>
                        </>
                      ) : null}
                      {p.status !== 'VERIFICATION_PENDING' && p.status !== 'PENDING' && p.status !== 'OVERDUE' && p.status !== 'PARTIAL' ? (
                        <span className="text-slate-400">-</span>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
