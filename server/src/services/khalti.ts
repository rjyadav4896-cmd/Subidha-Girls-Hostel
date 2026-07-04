import { getEnv } from '../config/env.js';

type KhaltiInitiateArgs = {
  returnUrl: string;
  websiteUrl: string;
  amountInPaisa: number;
  purchaseOrderId: string;
  purchaseOrderName: string;
  customer: { name: string; email: string; phone: string };
};

export async function khaltiInitiate(args: KhaltiInitiateArgs) {
  const env = getEnv();
  if (!env.KHALTI_SECRET_KEY) throw new Error('Khalti not configured');

  const res = await fetch('https://a.khalti.com/api/v2/epayment/initiate/', {
    method: 'POST',
    headers: {
      Authorization: `Key ${env.KHALTI_SECRET_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      return_url: args.returnUrl,
      website_url: args.websiteUrl,
      amount: args.amountInPaisa,
      purchase_order_id: args.purchaseOrderId,
      purchase_order_name: args.purchaseOrderName,
      customer_info: args.customer
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Khalti initiate failed: ${text || res.status}`);
  }

  return (await res.json()) as { pidx: string; payment_url: string; expires_at?: string };
}

export async function khaltiLookup(pidx: string) {
  const env = getEnv();
  if (!env.KHALTI_SECRET_KEY) throw new Error('Khalti not configured');

  const res = await fetch('https://a.khalti.com/api/v2/epayment/lookup/', {
    method: 'POST',
    headers: {
      Authorization: `Key ${env.KHALTI_SECRET_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ pidx })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Khalti lookup failed: ${text || res.status}`);
  }

  return (await res.json()) as {
    status: string;
    total_amount: number;
    transaction_id?: string;
    fee?: number;
    refunded?: boolean;
    purchase_order_id?: string;
  };
}

