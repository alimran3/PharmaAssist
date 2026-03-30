import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi';
import { fetchAutocomplete, clearAutocomplete } from '../../store/slices/medicineSlice';
import { useDebounce } from '../../hooks/useDebounce';
import { getMedicineImage } from '../../utils/helpers';

export default function SearchBar({ onSelect, onSearch, placeholder = 'Search any medicine...', className = '' }) {
  const dispatch = useDispatch();
  const { autocomplete } = useSelector((s) => s.medicines);
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      dispatch(fetchAutocomplete(debouncedQuery));
      setShowDropdown(true);
    } else {
      dispatch(clearAutocomplete());
      setShowDropdown(false);
    }
  }, [debouncedQuery, dispatch]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (medicine) => {
    setQuery(medicine.brandName);
    setShowDropdown(false);
    dispatch(clearAutocomplete());
    if (onSelect) onSelect(medicine);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowDropdown(false);
    if (onSearch) onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    dispatch(clearAutocomplete());
    setShowDropdown(false);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative group">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 group-focus-within:text-brand-500 transition-colors" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => autocomplete.length > 0 && setShowDropdown(true)}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white dark:bg-surface-800/90
                       border border-surface-200 dark:border-surface-700
                       text-surface-800 dark:text-surface-100
                       placeholder:text-surface-400 dark:placeholder:text-surface-500
                       focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500
                       shadow-sm hover:shadow-md focus:shadow-lg
                       transition-all duration-300 text-sm"
          />
          {query && (
            <button type="button" onClick={handleClear} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
              <HiOutlineX className="w-4 h-4 text-surface-400" />
            </button>
          )}
        </div>
      </form>

      {/* Autocomplete dropdown */}
      {showDropdown && autocomplete.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-2xl shadow-glass-lg overflow-hidden z-50 animate-slide-down">
          <div className="max-h-72 overflow-y-auto divide-y divide-surface-100 dark:divide-surface-800/50">
            {autocomplete.map((med) => (
              <button
                key={med._id}
                onClick={() => handleSelect(med)}
                className="w-full flex items-center gap-3 p-3 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors text-left group"
              >
                <img
                  src={getMedicineImage(med.imageUrl)}
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover bg-surface-100 dark:bg-surface-700 flex-shrink-0"
                  onError={(e) => { e.target.src = '/placeholder-medicine.png'; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate group-hover:text-brand-500 transition-colors">
                    {med.brandName} <span className="text-surface-400 font-normal">{med.strength}</span>
                  </p>
                  <p className="text-xs text-surface-500 truncate">{med.genericName} · {med.manufacturer}</p>
                </div>
                <span className="flex-shrink-0 badge badge-info text-[10px]">{med.dosageForm}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}