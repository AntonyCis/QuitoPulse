import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const QUITO_ZOOM = 12;
const BASEMAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onChange: (latitude: number, longitude: number) => void;
  onResolveAddress?: (latitude: number, longitude: number) => void;
}

export function LocationPicker({ latitude, longitude, onChange, onResolveAddress }: LocationPickerProps) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const valueRef = useRef({ latitude, longitude });
  const onChangeRef = useRef(onChange);
  const onResolveRef = useRef(onResolveAddress);
  onChangeRef.current = onChange;
  onResolveRef.current = onResolveAddress;

  // Initialize map + draggable marker
  useEffect(() => {
    if (!container.current || map.current) return;

    const { latitude: lat, longitude: lng } = valueRef.current;

    const m = new maplibregl.Map({
      container: container.current,
      style: BASEMAP_STYLE,
      center: [lng, lat],
      zoom: QUITO_ZOOM,
      attributionControl: false,
    });

    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    const mk = new maplibregl.Marker({ draggable: true, color: '#4cd7f6' })
      .setLngLat([lng, lat])
      .addTo(m);
    marker.current = mk;

    const updateFrom = (lngLat: maplibregl.LngLat) => {
      valueRef.current = { latitude: lngLat.lat, longitude: lngLat.lng };
      onChangeRef.current(lngLat.lat, lngLat.lng);
      onResolveRef.current?.(lngLat.lat, lngLat.lng);
    };

    mk.on('dragend', () => updateFrom(mk.getLngLat()));

    m.on('click', (e) => {
      mk.setLngLat(e.lngLat);
      updateFrom(e.lngLat);
    });

    m.on('load', () => m.resize());

    map.current = m;

    return () => {
      m.remove();
      map.current = null;
      marker.current = null;
    };
  }, []);

  // Keep marker in sync with external changes (e.g. geolocation)
  useEffect(() => {
    const { latitude: prevLat, longitude: prevLng } = valueRef.current;
    valueRef.current = { latitude, longitude };
    const mk = marker.current;
    if (!mk) return;
    mk.setLngLat([longitude, latitude]);
    if (prevLat !== latitude || prevLng !== longitude) {
      map.current?.panTo([longitude, latitude], { duration: 500 });
    }
  }, [latitude, longitude]);

  return (
    <div className="relative overflow-hidden rounded-xl border" style={{ borderColor: '#ffffff15' }}>
      <div ref={container} className="h-52 w-full sm:h-64" />
      <div
        className="pointer-events-none absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-medium backdrop-blur-xl"
        style={{ backgroundColor: 'rgba(23,31,51,0.8)', color: '#c7c4d7', border: '1px solid rgba(255,255,255,0.12)' }}
      >
        Arrastra o toca el mapa para ubicar
      </div>
      <div
        className="pointer-events-none absolute bottom-2 right-2 rounded-full px-2.5 py-0.5 font-mono-data text-[11px] backdrop-blur-xl"
        style={{ backgroundColor: 'rgba(6,14,32,0.85)', color: '#4cd7f6', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {latitude.toFixed(5)}, {longitude.toFixed(5)}
      </div>
    </div>
  );
}