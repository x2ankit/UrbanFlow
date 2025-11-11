import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, X } from 'lucide-react';
// import @maptiler/geocoding dynamically to avoid bundling issues

const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '12px'
};

interface MapComponentProps {
  onLocationSelect?: (location: { lat: number; lng: number; address: string; type?: 'pickup' | 'dropoff' | 'current' }) => void;
  onRouteCalculated?: (distanceKm: number, durationMins: number) => void;
  showDirections?: boolean;
  initialPickup?: { lat: number; lng: number };
  initialDropoff?: { lat: number; lng: number };
}

const haversineDistanceKm = (a: [number, number], b: [number, number]) => {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const sinDlat = Math.sin(dLat / 2);
  const sinDlon = Math.sin(dLon / 2);
  const aa = sinDlat * sinDlat + sinDlon * sinDlon * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return R * c;
};

export const MapComponent: React.FC<MapComponentProps> = ({ onLocationSelect, onRouteCalculated, showDirections = false }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const pickupMarkerRef = useRef<any>(null);
  const dropoffMarkerRef = useRef<any>(null);

  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');

  useEffect(() => {
    const key = import.meta.env.VITE_MAPTILER_KEY;
    if (!key) {
      console.error('VITE_MAPTILER_KEY is not set');
      return;
    }
    if (!containerRef.current) return;

    (async () => {
      const maplibregl = (await import('maplibre-gl')).default;
      mapRef.current = new maplibregl.Map({
        container: containerRef.current,
        style: `https://api.maptiler.com/maps/streets/style.json?key=${key}`,
        center: [77.209, 28.6139],
        zoom: 12,
      });
      mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    })();

    return () => mapRef.current?.remove();
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    if (currentLocation) {
      mapRef.current.setCenter([currentLocation.lng, currentLocation.lat]);
      mapRef.current.setZoom(14);
    }
  }, [currentLocation]);

  const setMarker = (markerRef: React.MutableRefObject<any>, coords: { lat: number; lng: number } | null, label?: string) => {
    if (!mapRef.current) return;
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    if (!coords) return;
    const el = document.createElement('div');
    el.style.width = '18px';
    el.style.height = '18px';
    el.style.borderRadius = '50%';
    el.style.background = label === 'A' ? '#3b82f6' : '#ef4444';
    el.style.border = '2px solid white';
    // create marker using map's constructor to avoid relying on module namespace
    markerRef.current = new (mapRef.current.constructor as any).Marker({ element: el }).setLngLat([coords.lng, coords.lat]).addTo(mapRef.current);
  };

  useEffect(() => setMarker(pickupMarkerRef, pickupCoords, 'A'), [pickupCoords]);
  useEffect(() => setMarker(dropoffMarkerRef, dropoffCoords, 'B'), [dropoffCoords]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setCurrentLocation(loc);
          // reverse geocode via MapTiler
          try {
            const mod: any = await import('@maptiler/geocoding');
            const geocoding = mod.geocoding || mod.default || mod;
            const res: any = await geocoding.forward(`${loc.lat},${loc.lng}`, { key: import.meta.env.VITE_MAPTILER_KEY });
            const place = res?.features?.[0];
            const address = place?.place_name || '';
            setPickup(address);
            setPickupCoords(loc);
            onLocationSelect?.({ lat: loc.lat, lng: loc.lng, address, type: 'current' });
          } catch (e) {
            setPickupCoords(loc);
            onLocationSelect?.({ lat: loc.lat, lng: loc.lng, address: '' });
          }
        },
        (err) => alert('Unable to get your location: ' + err.message)
      );
    } else alert('Geolocation not supported');
  };

  const search = async (query: string, setter: (s: any) => void) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      const mod: any = await import('@maptiler/geocoding');
      const geocoding = mod.geocoding || mod.default || mod;
      const res: any = await geocoding.forward(query, { key: import.meta.env.VITE_MAPTILER_KEY });
      const feats = res?.features || [];
      setter(feats);
    } catch (e) {
      console.error('Geocoding error', e);
      setter([]);
    }
  };

  const onSelectSuggestion = (feature: any, target: 'pickup' | 'dropoff') => {
    const [lng, lat] = feature.center || [0, 0];
    const address = feature.place_name || feature.text || '';
      if (target === 'pickup') {
      setPickup(address);
      setPickupCoords({ lat, lng });
        onLocationSelect?.({ lat, lng, address, type: 'pickup' });
      mapRef.current?.flyTo({ center: [lng, lat], zoom: 14 });
      setSuggestions([]);
    } else {
      setDropoff(address);
      setDropoffCoords({ lat, lng });
      onLocationSelect?.({ lat, lng, address, type: 'dropoff' });
      mapRef.current?.flyTo({ center: [lng, lat], zoom: 14 });
      setSuggestions([]);
    }
  };

  const calculateRoute = () => {
    if (!pickupCoords || !dropoffCoords) return;
    const distKm = haversineDistanceKm([pickupCoords.lng, pickupCoords.lat], [dropoffCoords.lng, dropoffCoords.lat]);
    setDistance(`${distKm.toFixed(2)} km`);
    const avgSpeedKmh = 40;
    const hours = distKm / avgSpeedKmh;
    const mins = Math.round(hours * 60);
    setDuration(`${mins} mins`);
    // notify parent
    if (onRouteCalculated) onRouteCalculated(distKm, mins);
    // fit bounds
    try {
      const minLng = Math.min(pickupCoords.lng, dropoffCoords.lng);
      const maxLng = Math.max(pickupCoords.lng, dropoffCoords.lng);
      const minLat = Math.min(pickupCoords.lat, dropoffCoords.lat);
      const maxLat = Math.max(pickupCoords.lat, dropoffCoords.lat);
      mapRef.current?.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 60 });
    } catch (e) {}
  };

  const clearRoute = () => {
    setPickup('');
    setDropoff('');
    setPickupCoords(null);
    setDropoffCoords(null);
    setDistance('');
    setDuration('');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Button onClick={getCurrentLocation} className="w-full gap-2" variant="outline">
          <Navigation className="h-4 w-4" />
          Use My Current Location
        </Button>

        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Enter pickup location..."
            className="pl-10"
            value={pickup}
            onChange={(e) => {
              setPickup(e.target.value);
              search(e.target.value, setSuggestions);
            }}
          />
          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 bg-white border mt-1 rounded shadow z-50 max-h-52 overflow-auto">
              {suggestions.map((s, i) => (
                <div key={i} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => onSelectSuggestion(s, 'pickup')}>
                  {s.place_name}
                </div>
              ))}
            </div>
          )}
        </div>

        {showDirections && (
          <>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-red-500" />
              <Input
                placeholder="Enter dropoff location..."
                className="pl-10"
                value={dropoff}
                onChange={(e) => {
                  setDropoff(e.target.value);
                  search(e.target.value, setSuggestions);
                }}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={calculateRoute} className="flex-1" disabled={!pickupCoords || !dropoffCoords}>
                Get Directions
              </Button>
              {(distance || duration) && (
                <Button onClick={clearRoute} variant="outline" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {(distance || duration) && (
              <div className="bg-primary/10 rounded-lg p-3 space-y-1">
                <p className="text-sm font-medium">Distance: <span className="text-primary">{distance}</span></p>
                <p className="text-sm font-medium">Duration: <span className="text-primary">{duration}</span></p>
              </div>
            )}
          </>
        )}
      </div>

      <div ref={containerRef} style={mapContainerStyle as any} />
    </div>
  );
};

export default MapComponent;
