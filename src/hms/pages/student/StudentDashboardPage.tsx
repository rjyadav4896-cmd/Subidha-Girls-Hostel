import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { clearStudentToken } from '../../lib/storage';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { daysUntil, formatDateDDMMYYYY, formatINR, formatOrdinalDay } from '../../lib/format';
import { PayNowModal } from './PayNowModal';

export function StudentDashboardPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [payId, setPayId] = useState<string | null>(null);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch('/api/student/dashboard', { role: 'student' });
      setData(res);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!data?.currentPayment) return;
    if (data.currentPayment.status === 'PAID') return;
    const t = window.setInterval(() => {
      void load();
    }, 10_000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.currentPayment?._id, data?.currentPayment?.status]);

  const current = data?.currentPayment ?? null;
  const next = data?.nextPayment ?? null;

  function breakdownText(payment: any) {
    const breakdown = payment?.billingBreakdown;
    const monthlyFee = breakdown?.monthlyFee ?? data?.student?.monthlyFee ?? 0;
    const leaveDiscount = payment?.leaveDeduction ?? breakdown?.leaveDiscountAmount ?? 0;
    const credit = breakdown?.creditApplied ?? payment?.creditCarriedOver ?? 0;
    const totalDue = breakdown?.totalDue ?? payment?.amountDue ?? 0;
    const leaveDays = breakdown?.leaveDays ?? 0;
    const dailyRate = breakdown?.billableDays ? Math.round(monthlyFee / breakdown.billableDays) : 0;
    const leaveDetail = leaveDays > 0 ? ` (${leaveDays} days x ${formatINR(dailyRate)} x leave discount)` : '';
    return `Monthly Fee: ${formatINR(monthlyFee)} | Leave Deduction: -${formatINR(leaveDiscount)}${leaveDetail} | Credit: -${formatINR(credit)} | Total Due: ${formatINR(totalDue)}`;
  }

  const currentBadge = useMemo(() => {
    if (!current) return { label: 'No bill found', cls: 'bg-slate-100 text-slate-700' };
    if (current.status === 'PAID') return { label: 'Payment Cleared', cls: 'bg-emerald-100 text-emerald-800' };
    if (current.status === 'VERIFICATION_PENDING') return { label: 'Verification Pending', cls: 'bg-amber-100 text-amber-800' };
    if (current.status === 'PARTIAL')
      return { label: `Balance Due: ${formatINR(Math.max(current.amountDue - current.amountPaid, 0))}`, cls: 'bg-amber-100 text-amber-800' };
    return { label: `Due: ${formatINR(current.amountDue)}`, cls: 'bg-red-100 text-red-800' };
  }, [current]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">Student</div>
            <div className="font-black text-slate-900">{data?.student?.fullName ?? '—'}</div>
            {typeof data?.student?.monthlyFee === 'number' && (
              <div className="text-xs text-slate-500">Monthly fee: {formatINR(data.student.monthlyFee)}</div>
            )}
            {data?.student?.billingAnchorDay && (
              <div className="text-xs text-slate-500">Your billing date: {formatOrdinalDay(data.student.billingAnchorDay)} of every month</div>
            )}
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              clearStudentToken();
              void apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
              nav('/student/login');
            }}
          >
            Logout
          </Button>
        </div>

        {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</div>}

        {loading ? (
          <Card title="Dashboard">Loading…</Card>
        ) : (
          <>
            <Card
              title="Current Billing Cycle"
              right={<span className={`text-xs font-black px-3 py-1 rounded-full ${currentBadge.cls}`}>{currentBadge.label}</span>}
            >
              {!current ? (
                <div className="text-sm text-slate-600">No current billing record.</div>
              ) : (
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-slate-500">Current Period</div>
                    <div className="font-semibold text-slate-900">
                      {formatDateDDMMYYYY(current.billingPeriodStart)} – {formatDateDDMMYYYY(current.billingPeriodEnd)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Amount Due</div>
                    <div className="font-black text-slate-900">{formatINR(current.amountDue)}</div>
                    <div className="text-xs text-slate-500">Due date: {formatDateDDMMYYYY(current.dueDate)}</div>
                    {daysUntil(current.dueDate) != null && (
                      <div className="text-xs text-slate-500">
                        {daysUntil(current.dueDate)! >= 0 ? `${daysUntil(current.dueDate)} days remaining` : `${Math.abs(daysUntil(current.dueDate)!)} days overdue`}
                      </div>
                    )}
                    <div className="text-xs text-slate-500">Paid: {formatINR(current.amountPaid)}</div>
                    <div className="mt-1 text-xs text-slate-600">{breakdownText(current)}</div>
                  </div>
                  <div className="flex items-end justify-end">
                    {(current.status === 'PENDING' || current.status === 'OVERDUE' || current.status === 'PARTIAL') && (
                      <Button variant="secondary" onClick={() => setPayId(current._id)} type="button">
                        Pay Now
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>

            <Card title="Next Billing Cycle Preview">
              {!next ? (
                <div className="text-sm text-slate-600">No upcoming bill yet.</div>
              ) : (
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-slate-500">Billing Period</div>
                    <div className="font-semibold text-slate-900">
                      {formatDateDDMMYYYY(next.billingPeriodStart)} – {formatDateDDMMYYYY(next.billingPeriodEnd)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Expected Due</div>
                    <div className="font-black text-slate-900">{formatINR(next.amountDue)}</div>
                    <div className="mt-1 text-xs text-slate-600">{breakdownText(next)}</div>
                  </div>
                </div>
              )}
            </Card>

            <Card title="Payment History">
              <div className="overflow-auto">
                <table className="min-w-[900px] w-full text-sm">
                  <thead className="text-left text-slate-500">
                    <tr>
                      <th className="py-2">Month</th>
                      <th className="py-2">Billing Period</th>
                      <th className="py-2">Due</th>
                      <th className="py-2">Paid</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Paid At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.payments ?? []).map((p: any) => {
                      const month = new Date(p.billingPeriodStart).toLocaleString('en-US', { month: 'short', year: 'numeric' });
                      const rowCls =
                        p.status === 'PAID'
                          ? 'bg-emerald-50'
                          : p.status === 'VERIFICATION_PENDING'
                            ? 'bg-amber-50'
                            : p.status === 'PENDING' || p.status === 'OVERDUE'
                              ? 'bg-red-50'
                              : 'bg-amber-50';
                      return (
                        <tr key={p._id} className={`border-t border-slate-100 ${rowCls}`}>
                          <td className="py-3 font-semibold text-slate-900">{month}</td>
                          <td className="py-3">
                            {formatDateDDMMYYYY(p.billingPeriodStart)} – {formatDateDDMMYYYY(p.billingPeriodEnd)}
                          </td>
                          <td className="py-3">{formatINR(p.amountDue)}</td>
                          <td className="py-3">{formatINR(p.amountPaid)}</td>
                          <td className="py-3">{p.status}</td>
                          <td className="py-3">{p.paidAt ? formatDateDDMMYYYY(p.paidAt) : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card title="Leave History">
              <div className="overflow-auto">
                <table className="min-w-[700px] w-full text-sm">
                  <thead className="text-left text-slate-500">
                    <tr>
                      <th className="py-2">From</th>
                      <th className="py-2">To</th>
                      <th className="py-2">Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.leaves ?? []).map((l: any) => (
                      <tr key={l._id} className="border-t border-slate-100">
                        <td className="py-3">{formatDateDDMMYYYY(l.startDate)}</td>
                        <td className="py-3">{l.endDate ? formatDateDDMMYYYY(l.endDate) : '—'}</td>
                        <td className="py-3">{l.totalDays ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>

      <PayNowModal
        open={!!payId}
        paymentRecordId={payId}
        onClose={() => setPayId(null)}
        onPaid={() => {
          setPayId(null);
          void load();
        }}
      />
    </div>
  );
}
