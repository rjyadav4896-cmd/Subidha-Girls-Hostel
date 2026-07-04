import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

type Settings = any;

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ settings: Settings; warning?: string | null }>('/api/admin/settings', { role: 'admin' });
      setSettings(res.settings);
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

  async function save() {
    if (!settings) return;
    setError(null);
    setSaving(true);
    try {
      const res = await apiFetch<{ settings: Settings }>('/api/admin/settings', { role: 'admin', method: 'PUT', body: JSON.stringify(settings) });
      setSettings(res.settings);
      const feesConfigured = Object.values(res.settings.fees ?? {}).every((fee) => Number(fee) > 0);
      setWarning(feesConfigured ? null : 'Please configure fees in Settings before adding students.');
      setMessage('Settings saved.');
    } catch (e: any) {
      setError(e?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function recalculatePending() {
    setError(null);
    setMessage(null);
    setRecalculating(true);
    try {
      const res = await apiFetch<{ checked: number; updated: number; skipped: number }>('/api/admin/payments/recalculate-pending', {
        role: 'admin',
        method: 'POST'
      });
      setMessage(`Recalculated pending payments. Checked ${res.checked}, updated ${res.updated}, skipped ${res.skipped}.`);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to recalculate');
    } finally {
      setRecalculating(false);
    }
  }

  if (loading) return <Card title="Settings">Loading…</Card>;
  if (!settings) return <Card title="Settings">{error ?? 'No settings'}</Card>;

  return (
    <div className="space-y-6">
      <Card title="Fee Configuration">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="2-Seater monthly fee"
            type="number"
            required
            min="1"
            value={settings.fees.twoSeater}
            onChange={(e) => setSettings({ ...settings, fees: { ...settings.fees, twoSeater: Number(e.target.value) } })}
          />
          <Input
            label="3-Seater monthly fee"
            type="number"
            required
            min="1"
            value={settings.fees.threeSeater}
            onChange={(e) => setSettings({ ...settings, fees: { ...settings.fees, threeSeater: Number(e.target.value) } })}
          />
          <Input
            label="4-Seater monthly fee"
            type="number"
            required
            min="1"
            value={settings.fees.fourSeater}
            onChange={(e) => setSettings({ ...settings, fees: { ...settings.fees, fourSeater: Number(e.target.value) } })}
          />
          <Input
            label="5-Seater monthly fee"
            type="number"
            required
            min="1"
            value={settings.fees.fiveSeater}
            onChange={(e) => setSettings({ ...settings, fees: { ...settings.fees, fiveSeater: Number(e.target.value) } })}
          />
          <Input
            label="Leave discount rate (0–1)"
            type="number"
            step="0.01"
            value={settings.leaveDiscountRate}
            onChange={(e) => setSettings({ ...settings, leaveDiscountRate: Number(e.target.value) })}
          />
          <Input
            label="Admin email"
            type="email"
            value={settings.adminEmail}
            onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
          />
        </div>
      </Card>

      <Card title="Payment Settings (Khalti / Manual QR)">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Hostel UPI ID" value={settings.hostelUpiId ?? ''} onChange={(e) => setSettings({ ...settings, hostelUpiId: e.target.value })} />
          <Input
            label="Hostel Display Name"
            value={settings.hostelDisplayName ?? ''}
            onChange={(e) => setSettings({ ...settings, hostelDisplayName: e.target.value })}
          />
          <label className="block">
            <div className="text-xs font-semibold text-slate-600 mb-1">Payment Gateway</div>
            <select
              value={settings.paymentGateway ?? 'NONE'}
              onChange={(e) => setSettings({ ...settings, paymentGateway: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value="NONE">None</option>
              <option value="KHALTI">Khalti</option>
            </select>
          </label>
          <Input
            label="Static QR Image URL"
            value={settings.staticQrImageUrl ?? ''}
            onChange={(e) => setSettings({ ...settings, staticQrImageUrl: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mt-6">
            <input
              type="checkbox"
              checked={!!settings.autoVerifyPayments}
              onChange={(e) => setSettings({ ...settings, autoVerifyPayments: e.target.checked })}
              className="rounded border-slate-300"
            />
            Auto-verify payments (gateway)
          </label>
        </div>
      </Card>

      {warning && <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">{warning}</div>}
      {message && <div className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">{message}</div>}
      {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</div>}
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" onClick={recalculatePending} disabled={recalculating} type="button">
          {recalculating ? 'Recalculating...' : 'Recalculate Pending Payments'}
        </Button>
        <Button onClick={save} disabled={saving} type="button">
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
