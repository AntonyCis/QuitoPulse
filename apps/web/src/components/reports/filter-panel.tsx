import { useCategories } from '../../hooks/use-categories';

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
      <div className="rounded-lg bg-white/95 p-3 shadow-lg backdrop-blur-sm">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Categorías</h3>
          {selectedCategories.size > 0 && (
            <button
              onClick={onClearFilters}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Limpiar
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const isSelected = selectedCategories.has(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => onToggleCategory(cat.id)}
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all"
                style={{
                  backgroundColor: isSelected ? cat.color : `${cat.color}20`,
                  color: isSelected ? 'white' : cat.color,
                  border: `1.5px solid ${cat.color}`,
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
