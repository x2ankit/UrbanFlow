import type { VercelRequest, VercelResponse } from '@vercel/node';

// Serverless endpoint to create a Razorpay order
// Expects POST JSON: { amount: number, currency?: string, receipt?: string, notes?: object }
// Requires env: RAZORPAY_KEY, RAZORPAY_SECRET

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).send('OK');

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const key = process.env.RAZORPAY_KEY;
  const secret = process.env.RAZORPAY_SECRET;
  if (!key || !secret) return res.status(500).json({ error: 'Razorpay credentials missing in server env' });

  const { amount, currency = 'INR', receipt, notes } = req.body || {};
  if (!amount || typeof amount !== 'number') return res.status(400).json({ error: 'Invalid amount' });

  try {
    const body = { amount: Math.round(amount), currency, receipt: receipt || `order_${Date.now()}`, notes: notes || {} };
    const auth = Buffer.from(`${key}:${secret}`).toString('base64');
    const resp = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await resp.json();
    if (!resp.ok) return res.status(502).json({ error: 'Razorpay create order failed', details: data });
    return res.status(200).json(data);
  } catch (err) {
    console.error('create-razorpay-order error', err);
    return res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
}
