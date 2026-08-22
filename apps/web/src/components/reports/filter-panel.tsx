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
    <div className="absolute top-20 left-4 z-10 max-w-xs">
      <div className="overflow-hidden rounded-2xl shadow-xl" style={{ backgroundColor: `${Q.charcoal}F0` }}>
        <div className="border-b px-4 py-3" style={{ borderColor: `${Q.white}10` }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Categorías</h3>
            {selectedCategories.size > 0 && (
              <button
                onClick={onClearFilters}
                className="text-xs font-medium transition-colors hover:opacity-80"
                style={{ color: Q.gold }}
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 p-3">
          {categories.map((cat) => {
            const isSelected = selectedCategories.has(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => onToggleCategory(cat.id)}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all"
                style={{
                  backgroundColor: isSelected ? cat.color : `${cat.color}25`,
                  color: isSelected ? 'white' : cat.color,
                  border: `1.5px solid ${isSelected ? cat.color : `${cat.color}50`}`,
                }}
              >
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: isSelected ? 'white' : cat.color }}
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
