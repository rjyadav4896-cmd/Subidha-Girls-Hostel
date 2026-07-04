import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Card } from '../../components/Card';

export function PaymentVerifyPage() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const [msg, setMsg] = useState('Verifying payment…');

  useEffect(() => {
    const pidx = sp.get('pidx');
    if (!pidx) {
      setMsg('Missing pidx.');
      return;
    }

    apiFetch(`/api/payments/verify?pidx=${encodeURIComponent(pidx)}`)
      .then((r: any) => {
        if (r.status === 'Completed') setMsg('Payment completed. Redirecting…');
        else setMsg(`Payment status: ${r.status}. Redirecting…`);
        window.setTimeout(() => nav('/student', { replace: true }), 1200);
      })
      .catch((e: any) => {
        setMsg(e?.message ?? 'Verification failed.');
      });
  }, [nav, sp]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <Card title="Payment Verification">{msg}</Card>
      </div>
    </div>
  );
}

