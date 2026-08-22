import { useRef, useState, useEffect } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Quito center coordinates
const QUITO_CENTER: [number, number] = [-78.4678, -0.1807];
const QUITO_ZOOM = 12;

// Free basemap from CARTO (no API key needed)
const BASEMAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

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
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const m = new maplibregl.Map({
      container: mapContainer.current,
      style: BASEMAP_STYLE,
      center: initialCenter,
      zoom: initialZoom,
    });

    m.addControl(new maplibregl.NavigationControl(), 'top-right');
    m.addControl(new maplibregl.GeolocateControl({ showUserLocation: true }), 'top-right');

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

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([report.longitude, report.latitude])
        .setPopup(
          new maplibregl.Popup({ offset: 20, closeButton: false, maxWidth: '240px' }).setHTML(`
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

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
}

export type { ReportMarker };
