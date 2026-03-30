import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import GlassCard from '../../components/ui/GlassCard';
import MedicineCard from '../../components/common/MedicineCard';
import { formatCurrency } from '../../utils/helpers';
import {
  HiOutlineLocationMarker, HiOutlineClock, HiOutlinePhone,
  HiOutlineStar, HiOutlineArrowLeft, HiOutlineSearch,
} from 'react-icons/hi';

export default function PharmacyView() {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('medicines');
  const [search, setSearch] = useState('');
  const [medCount, setMedCount] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [storeRes, medRes, revRes] = await Promise.all([
          api.get(`/stores/${id}/public`),
          api.get(`/stores/${id}/medicines`, { params: { limit: 30 } }),
          api.get(`/reviews/store/${id}`, { params: { limit: 10 } }),
        ]);
        setStore(storeRes.data.data.store);
        setMedCount(storeRes.data.data.medicineCount);
        setMedicines(medRes.data.data.medicines);
        setReviews(revRes.data.data.reviews);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleSearch = async (e) => {
    e?.preventDefault();
    try {
      const { data } = await api.get(`/stores/${id}/medicines`, { params: { search, limit: 30 } });
      setMedicines(data.data.medicines);
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="glass rounded-2xl h-48 animate-pulse mb-6" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl h-52 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="page-container text-center py-20">
        <p className="text-4xl mb-3">🏪</p>
        <p className="text-lg font-semibold">Pharmacy not found</p>
        <Link to="/patient" className="btn-primary text-sm mt-4 inline-flex">← Go back</Link>
      </div>
    );
  }

  const tabs = [
    { key: 'medicines', label: `Medicines (${medCount})` },
    { key: 'about', label: 'About' },
    { key: 'reviews', label: `Reviews (${store.totalReviews})` },
  ];

  return (
    <div className="page-container">
      {/* Back */}
      <Link to="/patient" className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-700 transition-colors mb-4">
        <HiOutlineArrowLeft className="w-4 h-4" /> Back
      </Link>

      {/* Store Header */}
      <GlassCard className="relative overflow-hidden mb-6">
        {store.coverPhotoUrl && (
          <div className="absolute inset-0 opacity-10">
            <img src={store.coverPhotoUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="relative flex flex-col sm:flex-row items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-100 to-emerald-100 dark:from-brand-900/30 dark:to-emerald-900/30 flex items-center justify-center flex-shrink-0 shadow-lg">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
            ) : (
              <span className="text-3xl">🏪</span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-display font-extrabold text-surface-900 dark:text-white">{store.pharmacyName}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-surface-500">
              <span className="flex items-center gap-1"><HiOutlineLocationMarker className="w-4 h-4" /> {store.exactAddress}</span>
              <span className="flex items-center gap-1"><HiOutlinePhone className="w-4 h-4" /> {store.phone}</span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1">
                <HiOutlineStar className="w-4 h-4 text-amber-500" />
                <span className="font-semibold">{store.averageRating?.toFixed(1) || '0.0'}</span>
                <span className="text-surface-400 text-xs">({store.totalReviews} reviews)</span>
              </span>
              <span className="flex items-center gap-1 text-sm">
                <HiOutlineClock className="w-4 h-4" />
                {store.operatingHours?.is24Hours ? (
                  <span className="badge badge-success text-[10px]">Open 24/7</span>
                ) : (
                  <span className="text-surface-500 text-xs">{store.operatingHours?.openingTime} – {store.operatingHours?.closingTime}</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl bg-surface-100 dark:bg-surface-800 mb-6">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${activeTab === tab.key ? 'bg-white dark:bg-surface-700 shadow-sm text-surface-900 dark:text-white' : 'text-surface-500 hover:text-surface-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'medicines' && (
        <div>
          <form onSubmit={handleSearch} className="mb-4 relative">
            <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search in this pharmacy..."
              className="input-field pl-11" />
          </form>
          {medicines.length === 0 ? (
            <div className="text-center py-12 text-surface-400"><p className="text-3xl mb-2">📦</p><p>No medicines found.</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {medicines.map((item) => (
                <MedicineCard key={item._id} item={{ ...item, store }} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'about' && (
        <GlassCard>
          <h2 className="font-display font-bold text-lg mb-4">About {store.pharmacyName}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><span className="text-surface-500">Owner:</span> <span className="font-semibold ml-1">{store.owner?.fullName || 'N/A'}</span></div>
            <div><span className="text-surface-500">Established:</span> <span className="font-semibold ml-1">{store.establishmentYear || 'N/A'}</span></div>
            <div><span className="text-surface-500">Drug License:</span> <span className="font-semibold ml-1">{store.drugLicenseNumber || 'N/A'}</span></div>
            <div><span className="text-surface-500">Trade License:</span> <span className="font-semibold ml-1">{store.tradeLicenseNumber || 'N/A'}</span></div>
            <div><span className="text-surface-500">Location:</span> <span className="font-semibold ml-1">{[store.appAddress?.area, store.appAddress?.upazilla, store.appAddress?.district].filter(Boolean).join(', ')}</span></div>
            <div><span className="text-surface-500">Off Day:</span> <span className="font-semibold ml-1">{store.operatingHours?.weeklyOffDay || 'None'}</span></div>
          </div>
        </GlassCard>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-surface-400"><p className="text-3xl mb-2">⭐</p><p>No reviews yet.</p></div>
          ) : reviews.map((review) => (
            <GlassCard key={review._id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm">{review.patient?.fullName || 'Patient'}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <HiOutlineStar key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-surface-300'}`} />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-surface-400">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              {review.reviewText && <p className="text-sm text-surface-600 dark:text-surface-400 mt-2">{review.reviewText}</p>}
              {review.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {review.tags.map((tag) => <span key={tag} className="badge badge-info text-[10px]">{tag}</span>)}
                </div>
              )}
              {review.ownerResponse && (
                <div className="mt-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border-l-2 border-brand-500">
                  <p className="text-xs font-semibold text-brand-600 mb-1">Owner's Response</p>
                  <p className="text-sm text-surface-600 dark:text-surface-400">{review.ownerResponse.text}</p>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}