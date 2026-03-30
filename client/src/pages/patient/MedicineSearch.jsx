import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchMedicines, browseMedicines, fetchCategories } from '../../store/slices/medicineSlice';
import SearchBar from '../../components/common/SearchBar';
import MedicineCard from '../../components/common/MedicineCard';
import { CATEGORY_ICONS, MEDICINE_CATEGORIES } from '../../utils/constants';
import { HiOutlineAdjustments, HiOutlineX } from 'react-icons/hi';

export default function MedicineSearch() {
  const dispatch = useDispatch();
  const { browseResults, searchResults, searchLoading, loading, categories, pagination } = useSelector((s) => s.medicines);
  const location = useSelector((s) => s.location.current);
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState('');
  const [sort, setSort] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleSearch = (query) => {
    setSearched(true);
    dispatch(browseMedicines({
      division: location.division,
      district: location.district,
      upazilla: location.upazilla,
      search: query,
      category: activeCategory || undefined,
      sort: sort || undefined,
      limit: 30,
    }));
  };

  const handleCategoryFilter = (cat) => {
    const newCat = cat === activeCategory ? '' : cat;
    setActiveCategory(newCat);
    dispatch(browseMedicines({
      division: location.division,
      district: location.district,
      category: newCat || undefined,
      sort: sort || undefined,
      limit: 30,
    }));
  };

  const results = browseResults;
  const isLoading = loading || searchLoading;

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="section-title">Find Medicine</h1>
        <p className="text-sm text-surface-500 mt-1">Search across all pharmacies in your area.</p>
      </div>

      {/* Search */}
      <SearchBar onSearch={handleSearch} placeholder="Search by medicine name, generic name..." className="mb-4" />

      {/* Filters row */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary text-xs ${showFilters ? 'border-brand-300 bg-brand-50 dark:bg-brand-900/20' : ''}`}>
          <HiOutlineAdjustments className="w-4 h-4" /> Filters
        </button>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-field text-xs py-2 w-auto">
          <option value="">Sort: Default</option>
          <option value="cheapest">Price: Low → High</option>
          <option value="name">Name: A → Z</option>
        </select>
        {activeCategory && (
          <button onClick={() => handleCategoryFilter('')} className="badge badge-info flex items-center gap-1 cursor-pointer">
            {activeCategory} <HiOutlineX className="w-3 h-3" />
          </button>
        )}
      </div>

      {showFilters && (
        <div className="glass rounded-2xl p-4 mb-6 animate-slide-down">
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">Categories</p>
          <div className="flex flex-wrap gap-2">
            {(categories.length > 0 ? categories : MEDICINE_CATEGORIES).map((cat) => (
              <button key={cat} onClick={() => handleCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all
                  ${activeCategory === cat
                    ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow'
                    : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
                  }`}>
                {CATEGORY_ICONS[cat] || '📦'} {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse">
              <div className="h-40 bg-surface-200 dark:bg-surface-800" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-surface-200 dark:bg-surface-700 rounded" />
                <div className="h-3 w-1/2 bg-surface-100 dark:bg-surface-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <p className="text-5xl mb-4">{searched ? '🔍' : '💊'}</p>
          <p className="font-display font-bold text-xl text-surface-700 dark:text-surface-300">
            {searched ? 'No results found' : 'Start searching'}
          </p>
          <p className="text-sm text-surface-500 mt-2">
            {searched ? 'Try a different name or change your location filters.' : 'Type a medicine name in the search bar above.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {results.map((item) => (
            <MedicineCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}