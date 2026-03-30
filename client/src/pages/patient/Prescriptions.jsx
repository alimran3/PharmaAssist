import { useEffect, useState } from 'react';
import api from '../../utils/api';
import GlassCard from '../../components/ui/GlassCard';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import {
  HiOutlinePlusCircle, HiOutlineDocumentText, HiOutlineTrash,
  HiOutlineEye, HiOutlineX, HiOutlinePhotograph,
} from 'react-icons/hi';

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [viewImage, setViewImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    imageUrl: '',
    doctorName: '',
    diagnosis: '',
    notes: '',
    status: 'Active',
  });

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/patients/prescriptions');
      setPrescriptions(data.data.prescriptions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrescriptions(); }, []);

  const handleSubmit = async () => {
    if (!form.imageUrl) return toast.error('Image URL is required.');
    setSubmitting(true);
    try {
      await api.post('/patients/prescriptions', form);
      toast.success('Prescription uploaded!');
      setShowAdd(false);
      setForm({ imageUrl: '', doctorName: '', diagnosis: '', notes: '', status: 'Active' });
      fetchPrescriptions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this prescription?')) return;
    try {
      await api.delete(`/patients/prescriptions/${id}`);
      toast.success('Prescription deleted.');
      fetchPrescriptions();
    } catch (err) {
      toast.error('Failed to delete.');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/patients/prescriptions/${id}`, { status });
      toast.success('Status updated.');
      fetchPrescriptions();
    } catch (err) {
      toast.error('Failed to update.');
    }
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Prescriptions</h1>
          <p className="text-sm text-surface-500 mt-0.5">Manage and store your prescription records.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-sm">
          <HiOutlinePlusCircle className="w-4 h-4" /> Upload
        </button>
      </div>

      {/* Prescriptions Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      ) : prescriptions.length === 0 ? (
        <GlassCard className="text-center py-16">
          <p className="text-5xl mb-3">📋</p>
          <p className="font-display font-bold text-xl text-surface-700 dark:text-surface-300">No prescriptions</p>
          <p className="text-sm text-surface-500 mt-1 mb-4">Upload your prescription images to keep a digital record.</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary text-sm inline-flex">Upload Prescription</button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {prescriptions.map((rx) => (
            <GlassCard key={rx._id} className="group">
              {/* Preview */}
              <div className="relative h-40 rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-800 mb-3 cursor-pointer"
                onClick={() => setViewImage(rx.imageUrl)}>
                <img src={rx.imageUrl} alt="Prescription" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <HiOutlineEye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className={`badge text-[10px] ${rx.status === 'Active' ? 'badge-success' : rx.status === 'Completed' ? 'badge-info' : 'badge-warning'}`}>
                  {rx.status}
                </span>
                <span className="text-xs text-surface-400">{formatDate(rx.uploadDate || rx.createdAt)}</span>
              </div>

              {rx.doctorName && <p className="text-sm font-semibold">Dr. {rx.doctorName}</p>}
              {rx.diagnosis && <p className="text-xs text-surface-500 mt-0.5">{rx.diagnosis}</p>}

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-surface-200/50 dark:border-surface-700/30">
                <select value={rx.status} onChange={(e) => handleStatusChange(rx._id, e.target.value)}
                  className="input-field text-xs py-1.5 flex-1">
                  <option>Active</option>
                  <option>Completed</option>
                  <option>Expired</option>
                </select>
                <button onClick={() => handleDelete(rx._id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="glass-strong rounded-3xl p-6 w-full max-w-md shadow-glass-lg animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">Upload Prescription</h2>
              <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800"><HiOutlineX className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Image URL *</label>
                <div className="relative">
                  <HiOutlinePhotograph className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://your-prescription-image.jpg" className="input-field pl-10" />
                </div>
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-xl bg-surface-100" />
                )}
              </div>
              <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Doctor Name</label>
                <input value={form.doctorName} onChange={(e) => setForm({ ...form, doctorName: e.target.value })} placeholder="Dr. ..." className="input-field" /></div>
              <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Diagnosis</label>
                <input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} placeholder="What is it for?" className="input-field" /></div>
              <div><label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes..." rows={2} className="input-field resize-none" /></div>

              <button onClick={handleSubmit} disabled={submitting} className="btn-emerald w-full">
                {submitting ? 'Uploading...' : 'Save Prescription'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer */}
      {viewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setViewImage(null)}>
          <div className="max-w-3xl max-h-[90vh] relative animate-scale-in">
            <button onClick={() => setViewImage(null)} className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white dark:bg-surface-800 shadow-lg flex items-center justify-center z-10">
              <HiOutlineX className="w-5 h-5" />
            </button>
            <img src={viewImage} alt="Prescription" className="w-full h-full object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}