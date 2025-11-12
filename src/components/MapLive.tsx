import React, { useEffect, useRef } from "react";

type Props = {
  center?: { lat: number; lon: number };
  zoom?: number;
  driver?: { lat: number; lon: number } | null;
  pickup?: { lat: number; lon: number } | null;
  drop?: { lat: number; lon: number } | null;
  routeGeojson?: any | null;
  styleUrl?: string;
};

export const MapLive: React.FC<Props> = ({ center, zoom = 13, driver, pickup, drop, routeGeojson, styleUrl }) => {
  const mapRef = useRef<any | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

   useEffect(() => {
     if (!containerRef.current) return;
 
    (async () => {
      const key = import.meta.env.VITE_MAPTILER_KEY;
      if (!key) {
        console.error('VITE_MAPTILER_KEY is not set - MapLive will not initialize');
        if (containerRef.current) {
          containerRef.current.innerHTML = '<div class="p-4 text-sm text-red-600">MapTiler API key missing. Set <code>VITE_MAPTILER_KEY</code> in your env and redeploy.</div>';
        }
        return;
      }

      // ensure maplibre css is loaded
      if (!document.getElementById('maplibre-css')) {
        const link = document.createElement('link');
        link.id = 'maplibre-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.css';
        document.head.appendChild(link);
      }

      const maplibregl = (await import('maplibre-gl')).default;
       const map = new maplibregl.Map({
         container: containerRef.current,
         style: styleUrl || `https://api.maptiler.com/maps/streets/style.json?key=${import.meta.env.VITE_MAPTILER_KEY}`,
         center: center ? [center.lon, center.lat] : [78.9629, 20.5937],
         zoom,
       });
       map.addControl(new maplibregl.NavigationControl());
       mapRef.current = map;
 
       map.on("load", () => {
         if (driver) {
           addOrUpdateMarker(map, "driver", [driver.lon, driver.lat], "#1d4ed8");
         }
         if (pickup) addOrUpdateMarker(map, "pickup", [pickup.lon, pickup.lat], "#059669");
         if (drop) addOrUpdateMarker(map, "drop", [drop.lon, drop.lat], "#dc2626");
         if (routeGeojson) {
           if (map.getSource("route")) map.removeLayer("route-line");
           if (map.getSource("route")) map.removeSource("route");
           map.addSource("route", { type: "geojson", data: routeGeojson });
           map.addLayer({ id: "route-line", type: "line", source: "route", paint: { "line-color": "#2563eb", "line-width": 4 } });
         }
       });
     })();

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (driver) addOrUpdateMarker(map, "driver", [driver.lon, driver.lat], "#1d4ed8");
    if (pickup) addOrUpdateMarker(map, "pickup", [pickup.lon, pickup.lat], "#059669");
    if (drop) addOrUpdateMarker(map, "drop", [drop.lon, drop.lat], "#dc2626");
    if (routeGeojson) {
      if (map.getSource("route")) {
        (map.getSource("route") as any).setData(routeGeojson);
      } else {
        map.addSource("route", { type: "geojson", data: routeGeojson });
        map.addLayer({ id: "route-line", type: "line", source: "route", paint: { "line-color": "#2563eb", "line-width": 4 } });
      }
    }
    // optionally fit bounds
    const points: [number, number][] = [];
    if (driver) points.push([driver.lon, driver.lat]);
    if (pickup) points.push([pickup.lon, pickup.lat]);
    if (drop) points.push([drop.lon, drop.lat]);
    if (points.length > 0) {
      const lons = points.map((p) => p[0]);
      const lats = points.map((p) => p[1]);
      const minLon = Math.min(...lons);
      const maxLon = Math.max(...lons);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      map.fitBounds([[minLon, minLat], [maxLon, maxLat]], { padding: 60, maxZoom: 16, duration: 500 });
    }
  }, [driver, pickup, drop, routeGeojson]);

  return <div ref={containerRef} className="w-full h-96 rounded-lg overflow-hidden" />;
};

function addOrUpdateMarker(map: any, id: string, lnglat: [number, number], color = "#111") {
  const existing = document.getElementById(`marker-${id}`);
  if (existing) existing.remove();
  const el = document.createElement("div");
  el.id = `marker-${id}`;
  el.style.width = "18px";
  el.style.height = "18px";
  el.style.borderRadius = "50%";
  el.style.background = color;
  el.style.border = "2px solid white";
  new (map.constructor as any).Marker(el).setLngLat(lnglat).addTo(map);
}

export default MapLive;
