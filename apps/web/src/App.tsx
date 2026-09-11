import { useState, useCallback } from 'react';
import { ReportMap, ReportMarker } from './components/map/report-map';
import { FilterPanel } from './components/reports/filter-panel';
import { ReportDetail } from './components/reports/report-detail';
import { CreateReport } from './components/reports/create-report';
import { Header } from './components/layout/header';
import { useReports } from './hooks/use-reports';

export function App() {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [showCreateReport, setShowCreateReport] = useState(false);
  const [mapBounds, setMapBounds] = useState<{
    west: number;
    south: number;
    east: number;
    north: number;
  } | null>(null);

  const { data: reportsData } = useReports({
    west: mapBounds?.west,
    south: mapBounds?.south,
    east: mapBounds?.east,
    north: mapBounds?.north,
  });

  const reports: ReportMarker[] = (reportsData?.items || []).map((r) => ({
    id: r.id,
    title: r.title,
    latitude: r.latitude,
    longitude: r.longitude,
    categoryColor: r.categoryColor,
    categoryName: r.categoryLabel,
    status: r.status,
    confirmationCount: r.confirmationCount,
    createdAt: r.createdAt,
  }));

  const handleToggleCategory = useCallback((categoryId: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  const handleReportClick = useCallback((id: string) => {
    setSelectedReportId(id);
  }, []);

  const handleMapMove = useCallback((bounds: { west: number; south: number; east: number; north: number }) => {
    setMapBounds(bounds);
  }, []);

  return (
    <div className="h-dvh w-screen overflow-hidden" style={{ backgroundColor: '#0b1326' }}>
      <Header onReportClick={() => setShowCreateReport(true)} />

      <div className="relative h-full w-full pt-[56px] sm:pt-[68px]">
        {/* Map */}
        <ReportMap
          reports={reports}
          onReportClick={handleReportClick}
          onMapMove={handleMapMove}
          selectedReportId={selectedReportId || undefined}
        />

        {/* Filters */}
        <FilterPanel
          selectedCategories={selectedCategories}
          onToggleCategory={handleToggleCategory}
          onClearFilters={() => setSelectedCategories(new Set())}
        />

        {/* Report count badge */}
        <div className="absolute bottom-4 left-4 z-10">
          <div
            className="rounded-full border px-3.5 py-1.5 font-mono-data text-mono-data backdrop-blur-xl"
            style={{
              backgroundColor: 'rgba(23,31,51,0.8)',
              borderColor: 'rgba(255,255,255,0.12)',
              color: '#4cd7f6',
            }}
          >
            {reportsData?.total || 0} reportes visibles
          </div>
        </div>

        {/* Report detail */}
        {selectedReportId && (
          <ReportDetail
            reportId={selectedReportId}
            onClose={() => setSelectedReportId(null)}
          />
        )}

        {/* Create report modal */}
        {showCreateReport && (
          <CreateReport
            onClose={() => setShowCreateReport(false)}
            onCreated={() => setShowCreateReport(false)}
          />
        )}
      </div>
    </div>
  );
}
