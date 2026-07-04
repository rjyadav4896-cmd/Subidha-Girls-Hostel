import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { formatDateDDMMYYYY } from '../../lib/format';

type Application = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  roomNumber: string;
  bedType: string;
  school: string;
  address: string;
  guardianName: string;
  localGuardianName: string;
  collegeOrWorkTiming: string;
  dateOfEntry: string;
  passportPhotoDataUrl?: string;
  citizenshipDataUrl?: string;
  createdAt: string;
};

type AcceptResult = {
  ok: boolean;
  studentId: string;
  username: string;
  temporaryPassword: string;
  adminWhatsappUrl?: string | null;
  studentWhatsappUrl?: string | null;
};

export function AdminApplicationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState<AcceptResult | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ applications: Application[] }>('/api/admin/applications', { role: 'admin' });
      setApplications(res.applications);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function accept(id: string) {
    setError(null);
    try {
      const result = await apiFetch<AcceptResult>('/api/admin/applications/' + id + '/accept', { method: 'POST', role: 'admin' });
      setAccepted(result);
      if (result.adminWhatsappUrl) {
        window.open(result.adminWhatsappUrl, '_blank', 'noopener,noreferrer');
      }
      await load();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to accept application');
    }
  }

  async function reject(id: string) {
    setError(null);
    try {
      await apiFetch('/api/admin/applications/' + id + '/reject', { method: 'POST', role: 'admin' });
      await load();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to reject application');
    }
  }

  return (
    <Card
      title="Pending Applications"
      right={
        <Button variant="ghost" onClick={load} disabled={loading}>
          Refresh
        </Button>
      }
    >
      {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-3">{error}</div>}
      {accepted && (
        <div className="mb-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-950">
          <div className="font-bold">Student accepted and dashboard login is active.</div>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            <div>
              Username: <span className="font-semibold">{accepted.username}</span>
            </div>
            <div>
              Temporary password: <span className="font-semibold">{accepted.temporaryPassword}</span>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {accepted.adminWhatsappUrl && (
              <a
                href={accepted.adminWhatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
              >
                Send Report to Admin WhatsApp
              </a>
            )}
            {accepted.studentWhatsappUrl && (
              <a
                href={accepted.studentWhatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-green-300 bg-white px-3 py-2 text-xs font-semibold text-green-800 hover:bg-green-100"
              >
                Send Login to Student WhatsApp
              </a>
            )}
          </div>
        </div>
      )}
      {loading ? (
        <div className="text-slate-600 text-sm">Loading…</div>
      ) : applications.length === 0 ? (
        <div className="text-slate-600 text-sm">No pending applications.</div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-[1200px] w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="py-2">Student</th>
                <th className="py-2">Room</th>
                <th className="py-2">Bed</th>
                <th className="py-2">Phone</th>
                <th className="py-2">School</th>
                <th className="py-2">Address</th>
                <th className="py-2">Guardian</th>
                <th className="py-2">Timing</th>
                <th className="py-2">Entry</th>
                <th className="py-2">Documents</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a._id} className="border-t border-slate-100">
                  <td className="py-3">
                    <div className="font-semibold text-slate-900">{a.fullName}</div>
                    <div className="text-xs text-slate-500">{a.email}</div>
                  </td>
                  <td className="py-3">{a.roomNumber}</td>
                  <td className="py-3">{a.bedType}</td>
                  <td className="py-3">{a.phone}</td>
                  <td className="py-3">{a.school}</td>
                  <td className="py-3 max-w-[180px]">{a.address}</td>
                  <td className="py-3">
                    <div>{a.guardianName}</div>
                    <div className="text-xs text-slate-500">Local: {a.localGuardianName}</div>
                  </td>
                  <td className="py-3">{a.collegeOrWorkTiming}</td>
                  <td className="py-3">{formatDateDDMMYYYY(a.dateOfEntry)}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      {a.passportPhotoDataUrl && (
                        <a
                          href={a.passportPhotoDataUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-slate-50"
                        >
                          Photo
                        </a>
                      )}
                      {a.citizenshipDataUrl && (
                        <a
                          href={a.citizenshipDataUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-slate-50"
                        >
                          Citizenship
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => accept(a._id)}>
                        Accept
                      </Button>
                      <Button variant="danger" onClick={() => reject(a._id)}>
                        Reject
                      </Button>
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
