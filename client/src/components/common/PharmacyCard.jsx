import { Link } from 'react-router-dom';
import { HiOutlineLocationMarker, HiOutlineStar, HiOutlineClock } from 'react-icons/hi';

export default function PharmacyCard({ store }) {
  return (
    <Link to={`/patient/pharmacy/${store._id}`} className="glass rounded-2xl p-4 card-hover block group">
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-100 to-emerald-100 dark:from-brand-900/30 dark:to-emerald-900/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {store.logoUrl ? (
            <img src={store.logoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
          ) : (
            <span className="text-2xl">🏪</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-sm text-surface-900 dark:text-white group-hover:text-brand-500 transition-colors truncate">
            {store.pharmacyName}
          </h3>

          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-0.5">
              <HiOutlineStar className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-semibold">{store.averageRating?.toFixed(1) || '0.0'}</span>
            </span>
            <span className="text-surface-300 dark:text-surface-600">·</span>
            <span className="text-xs text-surface-500">{store.totalReviews || 0} reviews</span>
          </div>

          <div className="flex items-center gap-1 mt-1 text-xs text-surface-500">
            <HiOutlineLocationMarker className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">
              {[store.appAddress?.area, store.appAddress?.upazilla].filter(Boolean).join(', ')}
            </span>
          </div>

          <div className="flex items-center gap-1 mt-1">
            <HiOutlineClock className="w-3 h-3 text-surface-400" />
            {store.operatingHours?.is24Hours ? (
              <span className="badge badge-success text-[9px]">24/7</span>
            ) : (
              <span className="text-[10px] text-surface-500">
                {store.operatingHours?.openingTime} – {store.operatingHours?.closingTime}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}