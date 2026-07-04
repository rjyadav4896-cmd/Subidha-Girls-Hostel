import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { formatDateDDMMYYYY, formatOrdinalDay } from '../../lib/format';

type Student = {
  _id: string;
  fullName: string;
  roomNumber: string;
  bedType: string;
  school: string;
  phone: string;
  email: string;
  address?: string;
  guardianName: string;
  localGuardianName?: string;
  collegeOrWorkTiming?: string;
  dateOfEntry: string;
  status: string;
  monthlyFee?: number;
  billingAnchorDay?: number;
  nextDueDate?: string;
};

export function AdminStudentsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ students: Student[]; warning?: string | null }>('/api/admin/students', { role: 'admin' });
      setStudents(res.students);
      setWarning(res.warning ?? null);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function remove(id: string) {
    if (!confirm('Mark this student as INACTIVE?')) return;
    await apiFetch('/api/admin/students/' + id, { method: 'DELETE', role: 'admin' });
    await load();
  }

  return (
    <Card
      title="Active Students"
      right={
        <Button variant="ghost" onClick={load} disabled={loading}>
          Refresh
        </Button>
      }
    >
      {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-3">{error}</div>}
      {warning && <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3">{warning}</div>}
      {loading ? (
        <div className="text-slate-600 text-sm">Loading…</div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-[1200px] w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="py-2">Student</th>
                <th className="py-2">Room</th>
                <th className="py-2">Bed</th>
                <th className="py-2">School</th>
                <th className="py-2">Address</th>
                <th className="py-2">Local Guardian</th>
                <th className="py-2">Timing</th>
                <th className="py-2">Phone</th>
                <th className="py-2">Entry</th>
                <th className="py-2">Billing Day</th>
                <th className="py-2">Next Due</th>
                <th className="py-2">Monthly Fee</th>
                <th className="py-2">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="border-t border-slate-100">
                  <td className="py-3">
                    <div className="font-semibold text-slate-900">{s.fullName}</div>
                    <div className="text-xs text-slate-500">{s.email}</div>
                  </td>
                  <td className="py-3">{s.roomNumber}</td>
                  <td className="py-3">{s.bedType}</td>
                  <td className="py-3">{s.school}</td>
                  <td className="py-3 max-w-[180px]">{s.address || '-'}</td>
                  <td className="py-3">{s.localGuardianName || '-'}</td>
                  <td className="py-3">{s.collegeOrWorkTiming || '-'}</td>
                  <td className="py-3">{s.phone}</td>
                  <td className="py-3">{formatDateDDMMYYYY(s.dateOfEntry)}</td>
                  <td className="py-3">{formatOrdinalDay(s.billingAnchorDay)}</td>
                  <td className="py-3">{formatDateDDMMYYYY(s.nextDueDate)}</td>
                  <td className="py-3">₹{Math.round(s.monthlyFee ?? 0).toLocaleString('en-IN')}</td>
                  <td className="py-3">{s.status}</td>
                  <td className="py-3">
                    <Button variant="danger" onClick={() => remove(s._id)}>
                      Remove
                    </Button>
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
