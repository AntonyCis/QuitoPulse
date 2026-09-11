import { useCategories } from '../../hooks/use-categories';
import { Q } from '../../lib/colors';

interface FilterPanelProps {
  selectedCategories: Set<string>;
  onToggleCategory: (categoryId: string) => void;
  onClearFilters: () => void;
}

export function FilterPanel({ selectedCategories, onToggleCategory, onClearFilters }: FilterPanelProps) {
  const { data: categories } = useCategories();

  if (!categories) return null;

  return (
    <div className="absolute left-0 right-0 top-[68px] z-10 px-4 sm:left-4 sm:right-auto sm:top-[84px] sm:max-w-xs sm:px-0">
      <div className="glass-card-solid overflow-hidden rounded-2xl">
        <div className="hidden items-center justify-between border-b px-4 py-3 sm:flex" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <h3 className="flex items-center gap-2 text-label-md text-on-surface">
            <span className="material-symbols-outlined text-[18px] text-secondary">filter_list</span>
            Categorias
          </h3>
          {selectedCategories.size > 0 && (
            <button
              onClick={onClearFilters}
              className="text-label-sm text-secondary transition-colors hover:text-secondary-fixed"
            >
              Limpiar
            </button>
          )}
        </div>
        <div className="flex gap-1.5 overflow-x-auto p-2 sm:flex-wrap sm:overflow-visible sm:p-3">
          {selectedCategories.size > 0 && (
            <button
              onClick={onClearFilters}
              className="flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1.5 text-label-sm font-medium transition-colors sm:hidden"
              style={{ color: Q.secondary, borderColor: `${Q.secondary}55` }}
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
              Limpiar
            </button>
          )}
          {categories.map((cat) => {
            const isSelected = selectedCategories.has(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => onToggleCategory(cat.id)}
                className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-label-sm font-medium transition-all"
                style={{
                  backgroundColor: isSelected ? cat.color : `${cat.color}22`,
                  color: isSelected ? '#0b1326' : cat.color,
                  border: `1px solid ${isSelected ? cat.color : `${cat.color}55`}`,
                  boxShadow: isSelected ? `0 0 12px ${cat.color}55` : 'none',
                }}
              >
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: isSelected ? `${Q.bg}` : cat.color }}
                />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
