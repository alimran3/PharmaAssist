import { useEffect, useState } from 'react';
import api from '../../utils/api';
import GlassCard from '../../components/ui/GlassCard';
import { formatDate, getInitials, calculateAge } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineSearch } from 'react-icons/hi';
import { Link } from 'react-router-dom';

export default function ManagePatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });

  const fetchPatients = async (page = 1) => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/patients', { params: { page, limit: 20 } });
      setPatients(data.data.patients);
      setPagination(data.data.pagination);
    } catch (err) {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  return (
    <div className="page-container">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin" className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          <HiOutlineArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="section-title">Manage Patients</h1>
          <p className="text-sm text-surface-500 mt-0.5">All registered patient accounts</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-4 h-16 animate-pulse" />
          ))}
        </div>
      ) : patients.length === 0 ? (
        <GlassCard className="text-center py-12">
          <p className="text-3xl mb-2">👥</p>
          <p className="text-surface-500">No patients found.</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {patients.map((patient) => (
            <GlassCard key={patient._id} className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-brand-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {getInitials(patient.fullName)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-bold text-sm">{patient.fullName}</h3>
                  <span className={`badge text-[10px] ${
                    patient.status === 'active' ? 'badge-success' : 'badge-danger'
                  }`}>
                    {patient.status}
                  </span>
                  {patient.bloodGroup && (
                    <span className="badge badge-danger text-[10px]">{patient.bloodGroup}</span>
                  )}
                </div>
                <p className="text-xs text-surface-500 mt-0.5">
                  {patient.email} · {patient.phone}
                </p>
                <p className="text-xs text-surface-400">
                  {patient.gender || 'N/A'}
                  {patient.dateOfBirth ? ` · Age: ${calculateAge(patient.dateOfBirth)}` : ''}
                  {patient.appAddress?.district ? ` · ${patient.appAddress.area || patient.appAddress.upazilla}, ${patient.appAddress.district}` : ''}
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-[10px] text-surface-400">Joined {formatDate(patient.createdAt)}</p>
                {patient.allergies?.length > 0 && (
                  <div className="flex gap-1 mt-1 justify-end">
                    {patient.allergies.slice(0, 3).map((a, i) => (
                      <span key={i} className="badge badge-warning text-[9px]">⚠ {a.name}</span>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>
          ))}

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {Array.from({ length: pagination.pages }).map((_, i) => (
                <button key={i} onClick={() => fetchPatients(i + 1)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all
                    ${pagination.page === i + 1
                      ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg'
                      : 'glass hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600'
                    }`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}