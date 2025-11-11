export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateFare(distanceKm: number, opts?: { baseFare?: number; perKm?: number }) {
  const baseFare = opts?.baseFare ?? 35; // ₹35 base
  const perKm = opts?.perKm ?? 10; // ₹10 per km
  const fare = baseFare + perKm * distanceKm;
  return Math.max(1, Number(fare.toFixed(2)));
}

export function generateOTP(length = 4) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

export function estimateETAInMinutes(distanceKm: number, avgSpeedKmph = 30) {
  if (avgSpeedKmph <= 0) return null;
  const hours = distanceKm / avgSpeedKmph;
  return Math.round(hours * 60);
}
