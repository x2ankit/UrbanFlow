import React, { useEffect, useRef } from "react";

interface MapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  className?: string;
}

const Map: React.FC<MapProps> = ({ center, zoom = 12, className }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    const key = import.meta.env.VITE_MAPTILER_KEY;
    if (!key) {
      console.error("VITE_MAPTILER_KEY is not set");
      return;
    }

    if (!containerRef.current) return;

    (async () => {
      const maplibregl = (await import('maplibre-gl')).default;
      mapRef.current = new maplibregl.Map({
        container: containerRef.current,
        style: `https://api.maptiler.com/maps/streets/style.json?key=${key}`,
        center: [center.lng, center.lat],
        zoom,
      });

      mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");
    })();

    return () => {
      try {
        mapRef.current?.remove();
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setCenter([center.lng, center.lat]);
    if (typeof zoom === "number") mapRef.current.setZoom(zoom);
  }, [center, zoom]);

  return <div ref={containerRef} className={className || "w-full h-96"} />;
};

export default Map;
