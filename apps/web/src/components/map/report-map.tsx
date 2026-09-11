import { useRef, useState, useEffect, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Quito center coordinates
const QUITO_CENTER: [number, number] = [-78.4678, -0.1807];
const QUITO_ZOOM = 12;

// Free basemap from CARTO (no API key needed)
const BASEMAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const HEAT_LAYER_ID = 'reports-heat';

type GeoJSONData = Parameters<maplibregl.GeoJSONSource['setData']>[0];

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

function buildHeatGeoJSON(reports: ReportMarker[]): GeoJSONData {
  return {
    type: 'FeatureCollection' as const,
    features: reports.map((r) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [r.longitude, r.latitude],
      },
      properties: {
        count: r.confirmationCount,
      },
    })),
  };
}

function buildPopupHTML(report: ReportMarker): string {
  return `
    <div class="report-popup">
      <div class="report-popup__title">${report.title}</div>
      <div class="report-popup__category" style="color:${report.categoryColor}">${report.categoryName}</div>
      <div class="report-popup__meta">${report.confirmationCount} confirmaciones</div>
    </div>
  `;
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
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [heatVisible, setHeatVisible] = useState(false);

  const closeHoverPopup = useCallback(() => {
    popupRef.current?.remove();
    popupRef.current = null;
  }, []);

  const openHoverPopup = useCallback(
    (report: ReportMarker) => {
      const m = map.current;
      if (!m) return;
      closeHoverPopup();
      const popup = new maplibregl.Popup({
        offset: 14,
        anchor: 'bottom',
        closeButton: false,
        focusAfterOpen: false,
        maxWidth: '260px',
      })
        .setLngLat([report.longitude, report.latitude])
        .setHTML(buildPopupHTML(report))
        .addTo(m);
      popupRef.current = popup;
    },
    [closeHoverPopup],
  );

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    markersRef.current.clear();

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
  }, [initialCenter, initialZoom, onMapMove]);

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
          el.classList.add('report-marker--selected');
        } else {
          el.classList.remove('report-marker--selected');
        }
        continue;
      }

      // Create marker element. The root element is positioned by MapLibre via
      // an inline `transform: translate(...)` — never override it (that made
      // markers fly to the top-left corner on hover). Hover scale is applied
      // to the inner dot from CSS.
      const el = document.createElement('div');
      el.className = 'report-marker';
      if (report.id === selectedReportId) {
        el.classList.add('report-marker--selected');
      }

      const dot = document.createElement('div');
      dot.className = 'report-marker__dot';
      dot.style.backgroundColor = report.categoryColor;
      el.appendChild(dot);

      el.addEventListener('mouseenter', () => openHoverPopup(report));
      el.addEventListener('mouseleave', closeHoverPopup);
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onReportClick(report.id);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([report.longitude, report.latitude])
        .addTo(map.current);

      markersRef.current.set(report.id, marker);
    }
  }, [reports, mapLoaded, selectedReportId, onReportClick, openHoverPopup, closeHoverPopup]);

  // Add heat source + layer once the map is ready
  useEffect(() => {
    const m = map.current;
    if (!m || !mapLoaded) return;
    if (m.getLayer(HEAT_LAYER_ID)) return;

    m.addSource(HEAT_LAYER_ID, { type: 'geojson', data: buildHeatGeoJSON(reports) });
    m.addLayer({
      id: HEAT_LAYER_ID,
      type: 'heatmap',
      source: HEAT_LAYER_ID,
      layout: { visibility: heatVisible ? 'visible' : 'none' },
      paint: {
        'heatmap-weight': [
          'interpolate',
          ['linear'],
          ['get', 'count'],
          0, 0,
          1, 0.4,
          30, 1,
        ],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 18, 2.4],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 5, 14, 16, 34],
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(23, 31, 51, 0)',
          0.1, 'rgba(128, 131, 255, 0.25)',
          0.35, 'rgba(128, 131, 255, 0.6)',
          0.55, '#4cd7f6',
          0.75, '#ffd54f',
          1, '#ff5252',
        ],
        'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 0, 0.5, 16, 0.65],
      },
    });
  }, [mapLoaded, reports, heatVisible]);

  // Keep heat data in sync
  useEffect(() => {
    const m = map.current;
    if (!m || !mapLoaded || !m.getLayer(HEAT_LAYER_ID)) return;
    (m.getSource(HEAT_LAYER_ID) as maplibregl.GeoJSONSource).setData(buildHeatGeoJSON(reports));
  }, [reports, mapLoaded]);

  // Toggle heat visibility
  useEffect(() => {
    const m = map.current;
    if (!m || !mapLoaded || !m.getLayer(HEAT_LAYER_ID)) return;
    m.setLayoutProperty(HEAT_LAYER_ID, 'visibility', heatVisible ? 'visible' : 'none');
  }, [heatVisible, mapLoaded]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />

      {/* Heat zone toggle */}
      <div className="absolute bottom-4 right-4 z-10">
        <button
          type="button"
          onClick={() => setHeatVisible((v) => !v)}
          aria-pressed={heatVisible}
          className="flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-xl transition-all hover:opacity-90"
          style={{
            backgroundColor: heatVisible ? 'rgba(76,215,246,0.15)' : 'rgba(23,31,51,0.8)',
            borderColor: heatVisible ? 'rgba(76,215,246,0.5)' : 'rgba(255,255,255,0.12)',
            color: heatVisible ? '#4cd7f6' : '#c7c4d7',
          }}
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" opacity="0.35" />
            <circle cx="12" cy="12" r="5" opacity="0.8" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
          </svg>
          {heatVisible ? 'Calor: activo' : 'Ver zona de calor'}
        </button>
      </div>
    </div>
  );
}

export type { ReportMarker };