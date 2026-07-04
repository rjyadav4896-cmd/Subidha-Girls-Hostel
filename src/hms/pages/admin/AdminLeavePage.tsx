import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { formatDateDDMMYYYY, formatINR } from '../../lib/format';

type Student = { _id: string; fullName: string };
type Leave = { _id: string; startDate: string; endDate?: string | null };

export function AdminLeavePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadStudents() {
    const res = await apiFetch<{ students: any[] }>('/api/admin/students', { role: 'admin' });
    setStudents(res.students.map((s) => ({ _id: s._id, fullName: s.fullName })));
  }

  async function loadLeaves(studentId: string) {
    if (!studentId) return;
    const res = await apiFetch<{ leaves: Leave[] }>(`/api/admin/students/${studentId}/leave`, { role: 'admin' });
    setLeaves(res.leaves);
  }

  useEffect(() => {
    void loadStudents();
  }, []);

  useEffect(() => {
    void loadLeaves(selectedId);
  }, [selectedId]);

  async function startLeave() {
    if (!selectedId || !startDate) return;
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await apiFetch(`/api/admin/students/${selectedId}/leave/start`, { method: 'POST', role: 'admin', body: JSON.stringify({ startDate }) });
      setStartDate('');
      await loadLeaves(selectedId);
    } catch (e: any) {
      setError(e?.message ?? 'Failed');
    } finally {
      setLoading(false);
    }
  }

  async function endLeave() {
    if (!selectedId || !endDate) return;
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ updatedPayment?: { amountDue: number } | null }>(`/api/admin/students/${selectedId}/leave/end`, {
        method: 'POST',
        role: 'admin',
        body: JSON.stringify({ endDate })
      });
      setEndDate('');
      if (res.updatedPayment) setMessage(`Leave ended. Payment updated to ${formatINR(res.updatedPayment.amountDue)}.`);
      else setMessage('Leave ended. No open payment needed updating.');
      await loadLeaves(selectedId);
    } catch (e: any) {
      setError(e?.message ?? 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card title="Leave Management">
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <div className="text-xs font-semibold text-slate-600 mb-1">Student</div>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value="">Select a student…</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.fullName}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <div className="flex items-end">
              <Button onClick={startLeave} disabled={!selectedId || !startDate || loading} type="button">
                Mark on Leave
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="End date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <div className="flex items-end">
              <Button variant="secondary" onClick={endLeave} disabled={!selectedId || !endDate || loading} type="button">
                End Leave
              </Button>
            </div>
          </div>
        </div>
        {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mt-3">{error}</div>}
        {message && <div className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 mt-3">{message}</div>}
      </Card>

      <Card title="Leave History">
        {!selectedId ? (
          <div className="text-slate-600 text-sm">Select a student to view leave history.</div>
        ) : leaves.length === 0 ? (
          <div className="text-slate-600 text-sm">No leaves recorded.</div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-[700px] w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="py-2">From</th>
                  <th className="py-2">To</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => (
                  <tr key={l._id} className="border-t border-slate-100">
                    <td className="py-3">{formatDateDDMMYYYY(l.startDate)}</td>
                    <td className="py-3">{l.endDate ? formatDateDDMMYYYY(l.endDate) : '—'}</td>
                    <td className="py-3">{l.endDate ? 'Ended' : 'ON LEAVE'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
