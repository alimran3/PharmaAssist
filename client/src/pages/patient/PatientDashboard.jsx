import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { browseMedicines, fetchCategories } from '../../store/slices/medicineSlice';
import { useAuth } from '../../hooks/useAuth';
import SearchBar from '../../components/common/SearchBar';
import MedicineCard from '../../components/common/MedicineCard';
import { CATEGORY_ICONS } from '../../utils/constants';
import { HiOutlineLocationMarker, HiOutlineAdjustments } from 'react-icons/hi';

export default function PatientDashboard() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { browseResults, categories, loading } = useSelector((s) => s.medicines);
  const location = useSelector((s) => s.location.current);
  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(browseMedicines({
      division: location.division,
      district: location.district,
      upazilla: location.upazilla,
      area: location.area,
      category: activeCategory || undefined,
      limit: 20,
    }));
  }, [dispatch, location, activeCategory]);

  const handleSearch = (query) => {
    dispatch(browseMedicines({
      division: location.division,
      district: location.district,
      upazilla: location.upazilla,
      search: query,
      limit: 30,
    }));
  };

  return (
    <div className="page-container">
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-surface-900 dark:text-white">
          Hey, {user?.fullName?.split(' ')[0]} 👋
        </h1>
        <div className="flex items-center gap-2 mt-1.5">
          <HiOutlineLocationMarker className="w-4 h-4 text-brand-500" />
          <span className="text-sm text-surface-500">
            {[location.area, location.upazilla, location.district].filter(Boolean).join(', ') || 'Set your location'}
          </span>
          <Link to="/patient/settings" className="text-xs font-semibold text-brand-500 hover:text-brand-600 ml-1">Change</Link>
        </div>
      </div>

      {/* Search */}
      <SearchBar
        onSearch={handleSearch}
        placeholder="Search medicine by name, generic, or category..."
        className="mb-6"
      />

      {/* Category Quick Filters */}
      <div className="mb-6 -mx-4 px-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveCategory('')}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
              ${!activeCategory
                ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/20'
                : 'glass hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400'
              }`}
          >
            All
          </button>
          {categories.slice(0, 12).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? '' : cat)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                ${activeCategory === cat
                  ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/20'
                  : 'glass hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400'
                }`}
            >
              <span>{CATEGORY_ICONS[cat] || '📦'}</span>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Medicine Grid */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title text-lg">
          {activeCategory ? `${CATEGORY_ICONS[activeCategory] || ''} ${activeCategory}` : 'Medicines Near You'}
        </h2>
        <span className="text-xs text-surface-500">{browseResults.length} found</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse">
              <div className="h-40 bg-surface-200 dark:bg-surface-800" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-surface-200 dark:bg-surface-700 rounded" />
                <div className="h-3 w-1/2 bg-surface-100 dark:bg-surface-800 rounded" />
                <div className="h-5 w-1/3 bg-surface-200 dark:bg-surface-700 rounded mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : browseResults.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-display font-bold text-lg text-surface-700 dark:text-surface-300">No medicines found</p>
          <p className="text-sm text-surface-500 mt-1">Try changing your location or search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {browseResults.map((item) => (
            <MedicineCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}