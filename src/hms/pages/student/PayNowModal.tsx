import { useEffect, useMemo, useState } from 'react';
import QRCode from 'react-qr-code';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { apiFetch } from '../../lib/api';
import { formatINR } from '../../lib/format';

export function PayNowModal({
  open,
  onClose,
  paymentRecordId,
  onPaid
}: {
  open: boolean;
  onClose: () => void;
  paymentRecordId: string | null;
  onPaid: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [init, setInit] = useState<any>(null);
  const [utr, setUtr] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (!open || !paymentRecordId) return;
    setError(null);
    setInit(null);
    setUtr('');
    setLoading(true);
    apiFetch(`/api/payments/initiate/${paymentRecordId}`, { method: 'POST', role: 'student' })
      .then((x) => setInit(x))
      .catch((e: any) => setError(e?.message ?? 'Failed to initiate'))
      .finally(() => setLoading(false));
  }, [open, paymentRecordId]);

  useEffect(() => {
    if (!open || !paymentRecordId) return;
    setPolling(true);
    const t = window.setInterval(() => {
      apiFetch(`/api/payments/status/${paymentRecordId}`, { role: 'student' })
        .then((s: any) => {
          if (s.status === 'PAID' || s.status === 'PARTIAL') {
            setPolling(false);
            onPaid();
          }
        })
        .catch(() => {});
    }, 10_000);
    return () => {
      window.clearInterval(t);
      setPolling(false);
    };
  }, [open, paymentRecordId, onPaid]);

  const amount = init?.amount ?? 0;
  const referenceId = init?.reference_id ?? '';
  const khaltiUrl = init?.khalti?.payment_url ?? '';
  const staticQr = init?.static_qr_image_url ?? '';

  async function submitUtr() {
    if (!paymentRecordId) return;
    setError(null);
    setChecking(true);
    try {
      await apiFetch(`/api/payments/submit-utr/${paymentRecordId}`, { method: 'POST', role: 'student', body: JSON.stringify({ utr_number: utr }) });
      // Keep modal open; polling will auto-close when admin confirms.
    } catch (e: any) {
      setError(e?.message ?? 'Failed to submit UTR');
    } finally {
      setChecking(false);
    }
  }

  const qrValue = khaltiUrl || '';
  const isQrReady = useMemo(() => !!qrValue && amount > 0, [qrValue, amount]);

  return (
    <Modal open={open} title="Pay via UPI" onClose={onClose}>
      {loading ? (
        <div className="text-sm text-slate-600">Preparing payment…</div>
      ) : error ? (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <div className="text-xs text-slate-500">Amount</div>
              <div className="font-black text-slate-900">{formatINR(amount)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Reference</div>
              <div className="font-mono text-xs text-slate-700">{referenceId}</div>
            </div>
          </div>

          {isQrReady ? (
            <div className="flex items-center justify-center p-4 rounded-2xl border border-slate-200 bg-white">
              <QRCode value={qrValue} size={220} />
            </div>
          ) : (
            <div className="text-sm text-slate-600">Payment gateway is not enabled. Ask admin to enable Khalti in Settings.</div>
          )}

          {khaltiUrl && (
            <a className="text-xs text-blue-700 underline break-all" href={khaltiUrl} target="_blank" rel="noreferrer">
              Open Khalti payment page
            </a>
          )}

          {staticQr && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-600">QR Fallback (manual)</div>
              <img src={staticQr} alt="Payment QR" className="w-full rounded-2xl border border-slate-200" />
            </div>
          )}

          <div className="text-xs text-slate-500">
            Pay via Khalti (supports wallet/eSewa/mobile banking/cards). If you paid via QR/manual transfer, enter your transaction ID below for verification.
          </div>

          <Input label="Transaction ID (token)" value={utr} onChange={(e) => setUtr(e.target.value)} placeholder="e.g., Khalti/eSewa token" />
          {polling && <div className="text-xs text-slate-500">Checking payment status…</div>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose} type="button">
              Close
            </Button>
            <Button onClick={submitUtr} disabled={!utr || checking || !paymentRecordId} type="button">
              {checking ? 'Submitting…' : "I've Paid"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
