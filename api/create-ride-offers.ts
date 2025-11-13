import type { VercelRequest, VercelResponse } from '@vercel/node';

// Serverless endpoint to create ride_offers for nearby drivers using Supabase RPC.
// Expects POST JSON: { ride_id: string, pickup_lat: number, pickup_lon: number, radius_km?: number }
// Requires env: SUPABASE_URL, SUPABASE_SERVICE_ROLE

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).send('OK');

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
  if (!SUPABASE_URL || !SERVICE_ROLE) return res.status(500).json({ error: 'Supabase server credentials missing' });

  const { ride_id, pickup_lat, pickup_lon, radius_km = 3 } = req.body || {};
  if (!ride_id || typeof pickup_lat !== 'number' || typeof pickup_lon !== 'number') return res.status(400).json({ error: 'Invalid payload' });

  try {
    // Call nearby_drivers RPC
    const rpcResp = await fetch(`${SUPABASE_URL}/rest/v1/rpc/nearby_drivers`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_ROLE,
        Authorization: `Bearer ${SERVICE_ROLE}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_lat: pickup_lat, p_lon: pickup_lon, p_radius_km: radius_km }),
    });
    const drivers = await rpcResp.json();
    if (!rpcResp.ok) {
      return res.status(502).json({ error: 'Supabase RPC failed', details: drivers });
    }

    if (!Array.isArray(drivers) || drivers.length === 0) return res.status(200).json({ created: 0, offers: [] });

    const inserts = drivers.map((d: any) => ({ ride_id, driver_id: d.driver_id }));

    const insertResp = await fetch(`${SUPABASE_URL}/rest/v1/ride_offers`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_ROLE,
        Authorization: `Bearer ${SERVICE_ROLE}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify(inserts),
    });
    const inserted = await insertResp.json();
    if (!insertResp.ok) return res.status(502).json({ error: 'Failed to insert ride_offers', details: inserted });

    return res.status(200).json({ created: inserted.length, offers: inserted });
  } catch (err) {
    console.error('create-ride-offers error', err);
    return res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
}
