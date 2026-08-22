import { useRef, useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

// Quito center coordinates
const QUITO_CENTER: [number, number] = [-78.4678, -0.1807];
const QUITO_ZOOM = 12;

interface ReportMarker {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  categoryColor: string;
  categoryName: string;
  status: string;
  confirmationCount: number;
  createdAt: string;
}

interface ReportMapProps {
  reports: ReportMarker[];
  onReportClick: (id: string) => void;
  onMapMove?: (bounds: { west: number; south: number; east: number; north: number }) => void;
  selectedReportId?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
}

export function ReportMap({
  reports,
  onReportClick,
  onMapMove,
  selectedReportId,
  initialCenter = QUITO_CENTER,
  initialZoom = QUITO_ZOOM,
}: ReportMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: true,
    });

    m.addControl(new mapboxgl.NavigationControl(), 'top-right');
    m.addControl(new mapboxgl.GeolocateControl({ showUserLocation: true }), 'top-right');

    m.on('load', () => setMapLoaded(true));

    m.on('moveend', () => {
      if (!onMapMove) return;
      const bounds = m.getBounds();
      if (!bounds) return;
      onMapMove({
        west: bounds.getWest(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        north: bounds.getNorth(),
      });
    });

    map.current = m;

    return () => {
      m.remove();
      map.current = null;
    };
  }, []);

  // Report markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const newIds = new Set(reports.map((r) => r.id));

    // Remove markers that no longer exist
    for (const [id, marker] of markersRef.current) {
      if (!newIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    }

    // Add or update markers
    for (const report of reports) {
      const existing = markersRef.current.get(report.id);

      if (existing) {
        // Update highlight state
        const el = existing.getElement();
        if (report.id === selectedReportId) {
          el.classList.add('ring-2', 'ring-white');
        } else {
          el.classList.remove('ring-2', 'ring-white');
        }
        continue;
      }

      // Create marker element
      const el = document.createElement('div');
      el.className = 'report-marker';
      el.style.cssText = `
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background-color: ${report.categoryColor};
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: transform 0.15s ease;
      `;
      el.onmouseenter = () => { el.style.transform = 'scale(1.2)'; };
      el.onmouseleave = () => { el.style.transform = 'scale(1)'; };

      if (report.id === selectedReportId) {
        el.classList.add('ring-2', 'ring-white');
      }

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([report.longitude, report.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 20, closeButton: false, maxWidth: '240px' }).setHTML(`
            <div style="padding: 4px; font-family: sans-serif;">
              <div style="font-weight: 600; font-size: 13px; margin-bottom: 2px;">${report.title}</div>
              <div style="color: ${report.categoryColor}; font-size: 11px; font-weight: 500;">${report.categoryName}</div>
              <div style="color: #666; font-size: 11px; margin-top: 2px;">${report.confirmationCount} confirmaciones</div>
            </div>
          `)
        )
        .addTo(map.current);

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onReportClick(report.id);
      });

      markersRef.current.set(report.id, marker);
    }
  }, [reports, mapLoaded, selectedReportId, onReportClick]);

  // No token - show placeholder
  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-900 text-white">
        <div className="text-center p-6">
          <div className="mb-4 text-5xl">🗺️</div>
          <p className="text-lg font-semibold mb-2">Mapbox Token Requerido</p>
          <p className="text-sm text-gray-300 mb-4">
            Agrega tu token de Mapbox en el archivo <code className="bg-gray-700 px-1.5 py-0.5 rounded text-xs">.env</code>
          </p>
          <div className="rounded-lg bg-gray-800 p-4 text-left text-xs">
            <p className="text-gray-400 mb-1"># En apps/web/.env</p>
            <p className="text-green-400">VITE_MAPBOX_TOKEN=pk.eyJ1Ijoi...</p>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Obtén tu token en <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-300">mapbox.com</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
}

export type { ReportMarker };
