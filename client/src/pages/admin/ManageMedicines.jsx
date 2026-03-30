import { useEffect, useState } from 'react';
import api from '../../utils/api';
import GlassCard from '../../components/ui/GlassCard';
import Modal from '../../components/ui/Modal';
import { getMedicineImage, formatCurrency } from '../../utils/helpers';
import { MEDICINE_CATEGORIES, DOSAGE_FORMS } from '../../utils/constants';
import toast from 'react-hot-toast';
import {
  HiOutlineSearch, HiOutlinePlusCircle, HiOutlinePencil,
  HiOutlineArrowLeft, HiOutlineDownload, HiOutlineStar,
} from 'react-icons/hi';
import { Link } from 'react-router-dom';

const emptyForm = {
  brandName: '', genericName: '', manufacturer: '', category: 'Other',
  dosageForm: 'Tablet', strength: '', standardMrp: '', description: '',
  prescriptionRequired: false, imageUrl: '', status: 'Active',
};

export default function ManageMedicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddSearch, setQuickAddSearch] = useState('');
  const [quickAddMedicines, setQuickAddMedicines] = useState([]);
  const [loadingQuickAdd, setLoadingQuickAdd] = useState(false);

  // Fetch all medicines for Quick Add (only those not in database)
  useEffect(() => {
    if (showQuickAdd) {
      fetchQuickAddMedicines();
    }
  }, [showQuickAdd]);

  const fetchQuickAddMedicines = async () => {
    try {
      setLoadingQuickAdd(true);
      // Fetch all medicines from database
      const { data } = await api.get('/medicines/search', { params: { page: 1, limit: 50000 } });
      const existingMeds = new Set(data.data.medicines.map(m => m.brandName.toLowerCase() + '|' + m.genericName.toLowerCase() + '|' + m.strength.toLowerCase()));
      
      // Filter out existing medicines from the quick add list
      const allMedicines = [
        { brandName: 'Napa', genericName: 'Paracetamol', manufacturer: 'Beximco Pharmaceuticals', category: 'Painkiller', dosageForm: 'Tablet', strength: '500mg', standardMrp: 1.5, description: 'Used for fever and mild to moderate pain relief.' },
        { brandName: 'Napa Extra', genericName: 'Paracetamol + Caffeine', manufacturer: 'Beximco Pharmaceuticals', category: 'Painkiller', dosageForm: 'Tablet', strength: '500mg + 65mg', standardMrp: 3, description: 'Enhanced pain reliever with caffeine.' },
        { brandName: 'Seclo', genericName: 'Omeprazole', manufacturer: 'Square Pharmaceuticals', category: 'Antacid', dosageForm: 'Capsule', strength: '20mg', standardMrp: 6, description: 'Proton pump inhibitor for acid reflux.' },
        { brandName: 'Sergel', genericName: 'Esomeprazole', manufacturer: 'Healthcare Pharmaceuticals', category: 'Antacid', dosageForm: 'Capsule', strength: '20mg', standardMrp: 7, description: 'For GERD and acid-related disorders.' },
        { brandName: 'Monas', genericName: 'Montelukast', manufacturer: 'Square Pharmaceuticals', category: 'Respiratory', dosageForm: 'Tablet', strength: '10mg', standardMrp: 12, description: 'Used for asthma and allergies.' },
        { brandName: 'Azimax', genericName: 'Azithromycin', manufacturer: 'Incepta Pharmaceuticals', category: 'Antibiotic', dosageForm: 'Tablet', strength: '500mg', standardMrp: 30, description: 'Broad-spectrum antibiotic.' },
        { brandName: 'Zimax', genericName: 'Azithromycin', manufacturer: 'Square Pharmaceuticals', category: 'Antibiotic', dosageForm: 'Tablet', strength: '500mg', standardMrp: 35, description: 'Antibiotic for bacterial infections.' },
        { brandName: 'Ciprocin', genericName: 'Ciprofloxacin', manufacturer: 'Square Pharmaceuticals', category: 'Antibiotic', dosageForm: 'Tablet', strength: '500mg', standardMrp: 8, description: 'Fluoroquinolone antibiotic.' },
        { brandName: 'Amoxil', genericName: 'Amoxicillin', manufacturer: 'Beximco Pharmaceuticals', category: 'Antibiotic', dosageForm: 'Capsule', strength: '500mg', standardMrp: 5, description: 'Penicillin-type antibiotic.' },
        { brandName: 'Novamet', genericName: 'Metformin', manufacturer: 'Square Pharmaceuticals', category: 'Antidiabetic', dosageForm: 'Tablet', strength: '500mg', standardMrp: 3, description: 'First-line treatment for type 2 diabetes.' },
        { brandName: 'Losartan', genericName: 'Losartan Potassium', manufacturer: 'Incepta Pharmaceuticals', category: 'Antihypertensive', dosageForm: 'Tablet', strength: '50mg', standardMrp: 8, description: 'For high blood pressure.' },
        { brandName: 'Fexo', genericName: 'Fexofenadine', manufacturer: 'Square Pharmaceuticals', category: 'Antihistamine', dosageForm: 'Tablet', strength: '120mg', standardMrp: 10, description: 'Non-drowsy antihistamine.' },
        { brandName: 'D-Rise', genericName: 'Cholecalciferol', manufacturer: 'Square Pharmaceuticals', category: 'Vitamin', dosageForm: 'Capsule', strength: '40000 IU', standardMrp: 15, description: 'Vitamin D3 supplement.' },
        { brandName: 'Calbo-D', genericName: 'Calcium + Vitamin D', manufacturer: 'ACI Pharmaceuticals', category: 'Supplement', dosageForm: 'Tablet', strength: '600mg + 200IU', standardMrp: 7, description: 'Calcium and Vitamin D supplement.' },
        { brandName: 'Savlon', genericName: 'Chlorhexidine + Cetrimide', manufacturer: 'ACI', category: 'Antiseptic', dosageForm: 'Solution', strength: '', standardMrp: 45, description: 'Antiseptic solution for wounds.' },
        { brandName: 'Pepcid', genericName: 'Famotidine', manufacturer: 'Drug International', category: 'Gastrointestinal', dosageForm: 'Tablet', strength: '20mg', standardMrp: 5, description: 'For acid reflux and ulcers.' },
        { brandName: 'Fluconazole', genericName: 'Fluconazole', manufacturer: 'Beximco', category: 'Antifungal', dosageForm: 'Capsule', strength: '150mg', standardMrp: 20, description: 'Antifungal medication.' },
        { brandName: 'Acivir', genericName: 'Acyclovir', manufacturer: 'Square', category: 'Antiviral', dosageForm: 'Tablet', strength: '400mg', standardMrp: 8, description: 'Antiviral for herpes infections.' },
        { brandName: 'Ace', genericName: 'Paracetamol', manufacturer: 'Square Pharmaceuticals', category: 'Painkiller', dosageForm: 'Tablet', strength: '500mg', standardMrp: 1.8, description: 'Pain and fever relief.' },
        { brandName: 'Ace Plus', genericName: 'Paracetamol + Caffeine', manufacturer: 'Square Pharmaceuticals', category: 'Painkiller', dosageForm: 'Tablet', strength: '500mg + 65mg', standardMrp: 3.5, description: 'Fast-acting pain relief.' },
        { brandName: 'Ace Capsule', genericName: 'Paracetamol', manufacturer: 'Square Pharmaceuticals', category: 'Painkiller', dosageForm: 'Capsule', strength: '500mg', standardMrp: 2, description: 'Capsule form for faster absorption.' },
        { brandName: 'Ace Syrup', genericName: 'Paracetamol', manufacturer: 'Square Pharmaceuticals', category: 'Painkiller', dosageForm: 'Syrup', strength: '120mg/5ml', standardMrp: 25, description: 'Liquid form for children.' },
        { brandName: 'Ace Drop', genericName: 'Paracetamol', manufacturer: 'Square Pharmaceuticals', category: 'Painkiller', dosageForm: 'Drop', strength: '100mg/ml', standardMrp: 30, description: 'Infant drops for fever.' },
        { brandName: 'Ace Extra', genericName: 'Paracetamol + Tramadol', manufacturer: 'Square Pharmaceuticals', category: 'Painkiller', dosageForm: 'Tablet', strength: '325mg + 37.5mg', standardMrp: 5, description: 'For moderate to severe pain.' },
        { brandName: 'Ace Gel', genericName: 'Diclofenac Diethylamine', manufacturer: 'Square Pharmaceuticals', category: 'Painkiller', dosageForm: 'Gel', strength: '1.16%', standardMrp: 35, description: 'Topical pain relief gel.' },
        { brandName: 'Ace Spray', genericName: 'Diclofenac Diethylamine', manufacturer: 'Square Pharmaceuticals', category: 'Painkiller', dosageForm: 'Spray', strength: '1.16%', standardMrp: 40, description: 'Spray for muscle and joint pain.' },
        { brandName: 'Napa Extend', genericName: 'Paracetamol', manufacturer: 'Beximco Pharmaceuticals', category: 'Painkiller', dosageForm: 'Tablet', strength: '665mg', standardMrp: 2.5, description: 'Extended release formula.' },
        { brandName: 'Napa Syrup', genericName: 'Paracetamol', manufacturer: 'Beximco Pharmaceuticals', category: 'Painkiller', dosageForm: 'Syrup', strength: '120mg/5ml', standardMrp: 22, description: 'For children fever and pain.' },
        { brandName: 'Napa Drop', genericName: 'Paracetamol', manufacturer: 'Beximco Pharmaceuticals', category: 'Painkiller', dosageForm: 'Drop', strength: '100mg/ml', standardMrp: 28, description: 'Infant drops.' },
        { brandName: 'Napa Quicks', genericName: 'Paracetamol', manufacturer: 'Beximco Pharmaceuticals', category: 'Painkiller', dosageForm: 'Tablet', strength: '500mg', standardMrp: 2, description: 'Fast-dissolving tablets.' },
        { brandName: 'Ace Gel Forte', genericName: 'Diclofenac Diethylamine', manufacturer: 'Square Pharmaceuticals', category: 'Painkiller', dosageForm: 'Gel', strength: '3%', standardMrp: 45, description: 'Strong topical pain relief.' },
        { brandName: 'Ace Inhaler', genericName: 'Salbutamol', manufacturer: 'Square Pharmaceuticals', category: 'Respiratory', dosageForm: 'Inhaler', strength: '100mcg', standardMrp: 120, description: 'For asthma and bronchospasm.' },
        { brandName: 'Ace Tablet', genericName: 'Paracetamol', manufacturer: 'Square Pharmaceuticals', category: 'Painkiller', dosageForm: 'Tablet', strength: '325mg', standardMrp: 1.5, description: 'Lower dose for mild pain.' },
        { brandName: 'Ace DS Tablet', genericName: 'Paracetamol', manufacturer: 'Square Pharmaceuticals', category: 'Painkiller', dosageForm: 'Tablet', strength: '650mg', standardMrp: 3, description: 'Double strength pain relief.' },
        { brandName: 'Napa A', genericName: 'Paracetamol + Aspirin', manufacturer: 'Beximco Pharmaceuticals', category: 'Painkiller', dosageForm: 'Tablet', strength: '300mg + 300mg', standardMrp: 2.5, description: 'Combination pain reliever.' },
        { brandName: 'Napa Extend 665', genericName: 'Paracetamol', manufacturer: 'Beximco Pharmaceuticals', category: 'Painkiller', dosageForm: 'Tablet', strength: '665mg', standardMrp: 2.8, description: 'Extended release for long-lasting relief.' },
        { brandName: 'Seclo Capsule', genericName: 'Omeprazole', manufacturer: 'Square Pharmaceuticals', category: 'Antacid', dosageForm: 'Capsule', strength: '40mg', standardMrp: 10, description: 'Higher strength for severe acid reflux.' },
        { brandName: 'Seclo D', genericName: 'Omeprazole + Domperidone', manufacturer: 'Square Pharmaceuticals', category: 'Antacid', dosageForm: 'Capsule', strength: '20mg + 10mg', standardMrp: 8, description: 'For acid reflux with nausea.' },
        { brandName: 'Sergel DS', genericName: 'Esomeprazole', manufacturer: 'Healthcare Pharmaceuticals', category: 'Antacid', dosageForm: 'Capsule', strength: '40mg', standardMrp: 12, description: 'Double strength esomeprazole.' },
        { brandName: 'Monas L', genericName: 'Montelukast + Levocetirizine', manufacturer: 'Square Pharmaceuticals', category: 'Respiratory', dosageForm: 'Tablet', strength: '10mg + 5mg', standardMrp: 15, description: 'For asthma with allergic rhinitis.' },
        { brandName: 'Monas Kid', genericName: 'Montelukast', manufacturer: 'Square Pharmaceuticals', category: 'Respiratory', dosageForm: 'Tablet', strength: '4mg', standardMrp: 8, description: 'Pediatric dose for children.' },
        { brandName: 'Azimax Suspension', genericName: 'Azithromycin', manufacturer: 'Incepta Pharmaceuticals', category: 'Antibiotic', dosageForm: 'Suspension', strength: '200mg/5ml', standardMrp: 50, description: 'Liquid antibiotic for children.' },
        { brandName: 'Azimax 250', genericName: 'Azithromycin', manufacturer: 'Incepta Pharmaceuticals', category: 'Antibiotic', dosageForm: 'Capsule', strength: '250mg', standardMrp: 20, description: 'Lower dose antibiotic.' },
        { brandName: 'Zimax 250', genericName: 'Azithromycin', manufacturer: 'Square Pharmaceuticals', category: 'Antibiotic', dosageForm: 'Capsule', strength: '250mg', standardMrp: 25, description: 'Lower dose for mild infections.' },
        { brandName: 'Ciprocin 250', genericName: 'Ciprofloxacin', manufacturer: 'Square Pharmaceuticals', category: 'Antibiotic', dosageForm: 'Tablet', strength: '250mg', standardMrp: 5, description: 'Lower dose fluoroquinolone.' },
        { brandName: 'Ciprocin IV', genericName: 'Ciprofloxacin', manufacturer: 'Square Pharmaceuticals', category: 'Antibiotic', dosageForm: 'Injection', strength: '200mg/100ml', standardMrp: 80, description: 'IV infusion for severe infections.' },
        { brandName: 'Amoxil 250', genericName: 'Amoxicillin', manufacturer: 'Beximco Pharmaceuticals', category: 'Antibiotic', dosageForm: 'Capsule', strength: '250mg', standardMrp: 3, description: 'Lower dose penicillin antibiotic.' },
        { brandName: 'Amoxil Suspension', genericName: 'Amoxicillin', manufacturer: 'Beximco Pharmaceuticals', category: 'Antibiotic', dosageForm: 'Suspension', strength: '125mg/5ml', standardMrp: 35, description: 'Liquid antibiotic for children.' },
        { brandName: 'Novamet XR', genericName: 'Metformin', manufacturer: 'Square Pharmaceuticals', category: 'Antidiabetic', dosageForm: 'Tablet', strength: '500mg', standardMrp: 5, description: 'Extended release metformin.' },
        { brandName: 'Novamet 850', genericName: 'Metformin', manufacturer: 'Square Pharmaceuticals', category: 'Antidiabetic', dosageForm: 'Tablet', strength: '850mg', standardMrp: 4, description: 'Higher dose for better control.' },
        { brandName: 'Losartan H', genericName: 'Losartan + Hydrochlorothiazide', manufacturer: 'Incepta Pharmaceuticals', category: 'Antihypertensive', dosageForm: 'Tablet', strength: '50mg + 12.5mg', standardMrp: 10, description: 'Combination BP medication.' },
        { brandName: 'Fexo 180', genericName: 'Fexofenadine', manufacturer: 'Square Pharmaceuticals', category: 'Antihistamine', dosageForm: 'Tablet', strength: '180mg', standardMrp: 12, description: 'Higher dose for severe allergies.' },
        { brandName: 'D-Rise 60K', genericName: 'Cholecalciferol', manufacturer: 'Square Pharmaceuticals', category: 'Vitamin', dosageForm: 'Capsule', strength: '60000 IU', standardMrp: 25, description: 'High dose Vitamin D3.' },
        { brandName: 'D-Rise Sachet', genericName: 'Cholecalciferol', manufacturer: 'Square Pharmaceuticals', category: 'Vitamin', dosageForm: 'Sachet', strength: '60000 IU', standardMrp: 30, description: 'Powder form Vitamin D3.' },
        { brandName: 'Calbo-D Plus', genericName: 'Calcium + Vitamin D + Zinc', manufacturer: 'ACI Pharmaceuticals', category: 'Supplement', dosageForm: 'Tablet', strength: '500mg + 200IU + 7.5mg', standardMrp: 10, description: 'Triple action bone health.' },
        { brandName: 'Savlon Liquid', genericName: 'Chlorhexidine + Cetrimide', manufacturer: 'ACI', category: 'Antiseptic', dosageForm: 'Solution', strength: '', standardMrp: 60, description: 'Larger bottle antiseptic.' },
        { brandName: 'Savlon Cream', genericName: 'Chlorhexidine + Cetrimide', manufacturer: 'ACI', category: 'Antiseptic', dosageForm: 'Cream', strength: '', standardMrp: 35, description: 'Antiseptic cream for wounds.' },
        { brandName: 'Pepcid 40', genericName: 'Famotidine', manufacturer: 'Drug International', category: 'Gastrointestinal', dosageForm: 'Tablet', strength: '40mg', standardMrp: 8, description: 'Higher strength for severe ulcers.' },
        { brandName: 'Fluconazole 50mg', genericName: 'Fluconazole', manufacturer: 'Beximco', category: 'Antifungal', dosageForm: 'Capsule', strength: '50mg', standardMrp: 10, description: 'Lower dose antifungal.' },
        { brandName: 'Fluconazole IV', genericName: 'Fluconazole', manufacturer: 'Beximco', category: 'Antifungal', dosageForm: 'Injection', strength: '200mg/100ml', standardMrp: 150, description: 'IV antifungal for systemic infections.' },
        { brandName: 'Acivir Cream', genericName: 'Acyclovir', manufacturer: 'Square', category: 'Antiviral', dosageForm: 'Cream', strength: '5%', standardMrp: 40, description: 'Topical antiviral for cold sores.' },
        { brandName: 'Acivir DT', genericName: 'Acyclovir', manufacturer: 'Square', category: 'Antiviral', dosageForm: 'Tablet', strength: '200mg', standardMrp: 5, description: 'Dispersible tablet form.' },
        { brandName: 'Acivir 800', genericName: 'Acyclovir', manufacturer: 'Square', category: 'Antiviral', dosageForm: 'Tablet', strength: '800mg', standardMrp: 12, description: 'High dose for shingles.' },
      ];
      
      const filtered = allMedicines.filter(m => !existingMeds.has(m.brandName.toLowerCase() + '|' + m.genericName.toLowerCase() + '|' + m.strength.toLowerCase()));
      setQuickAddMedicines(filtered);
    } catch (err) {
      console.error('Failed to fetch quick add medicines:', err);
    } finally {
      setLoadingQuickAdd(false);
    }
  };

  const fetchMedicines = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (search) params.q = search;
      const { data } = await api.get('/medicines/search', { params });
      setMedicines(data.data.medicines || []);
      setPagination(data.data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      console.error('Failed to load medicines:', err);
      toast.error(err.response?.data?.message || 'Failed to load medicines');
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMedicines(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMedicines(1);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEdit = (med) => {
    setEditingId(med._id);
    setForm({
      brandName: med.brandName || '',
      genericName: med.genericName || '',
      manufacturer: med.manufacturer || '',
      category: med.category || 'Other',
      dosageForm: med.dosageForm || 'Tablet',
      strength: med.strength || '',
      standardMrp: med.standardMrp || '',
      description: med.description || '',
      prescriptionRequired: med.prescriptionRequired || false,
      imageUrl: med.imageUrl || '',
      status: med.status || 'Active',
    });
    setShowModal(true);
  };

  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const handleSave = async () => {
    if (!form.brandName || !form.genericName) {
      return toast.error('Brand name and generic name are required.');
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        standardMrp: parseFloat(form.standardMrp) || 0,
      };

      if (editingId) {
        await api.put(`/admin/medicines/${editingId}`, payload);
        toast.success('Medicine updated!');
      } else {
        await api.post('/admin/medicines', payload);
        toast.success('Medicine added to master database!');
      }
      setShowModal(false);
      fetchMedicines(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const quickAddMedicine = async (med) => {
    setSaving(true);
    try {
      await api.post('/admin/medicines', {
        ...med,
        standardMrp: parseFloat(med.standardMrp) || 0,
      });
      toast.success(`${med.brandName} added!`);
      fetchQuickAddMedicines(); // Refresh the list
      fetchMedicines(pagination.page); // Refresh main list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add medicine.');
    } finally {
      setSaving(false);
    }
  };

  const filteredQuickAdd = quickAddMedicines.filter(m => 
    m.brandName.toLowerCase().includes(quickAddSearch.toLowerCase()) ||
    m.genericName.toLowerCase().includes(quickAddSearch.toLowerCase()) ||
    m.manufacturer.toLowerCase().includes(quickAddSearch.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
            <HiOutlineArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="section-title">Master Medicine Database</h1>
            <p className="text-sm text-surface-500 mt-0.5">
              {pagination.total || medicines.length} medicines in database
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowQuickAdd(true)} className="btn-secondary text-sm">
            <HiOutlineStar className="w-4 h-4" /> Quick Add
          </button>
          <button onClick={openAdd} className="btn-primary text-sm">
            <HiOutlinePlusCircle className="w-4 h-4" /> Add Medicine
          </button>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6 relative">
        <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search medicines..." className="input-field pl-11" />
      </form>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-4 flex gap-4 animate-pulse">
              <div className="w-12 h-12 rounded-xl bg-surface-200 dark:bg-surface-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-surface-200 dark:bg-surface-700 rounded" />
                <div className="h-3 w-32 bg-surface-100 dark:bg-surface-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : medicines.length === 0 ? (
        <GlassCard className="text-center py-12">
          <p className="text-3xl mb-2">💊</p>
          <p className="text-surface-500">No medicines found.</p>
          <button onClick={openAdd} className="mt-4 btn-primary text-sm">
            <HiOutlinePlusCircle className="w-4 h-4" /> Add First Medicine
          </button>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {medicines.map((med) => (
            <GlassCard key={med._id} className="flex items-center gap-4 group hover:border-brand-500/20">
              <img src={getMedicineImage(med.imageUrl)} alt={med.brandName}
                className="w-12 h-12 rounded-xl object-cover bg-surface-100 dark:bg-surface-800 flex-shrink-0"
                onError={(e) => { e.target.src = '/placeholder-medicine.png'; }} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-bold text-sm">{med.brandName} {med.strength}</h3>
                  <span className="badge badge-info text-[10px]">{med.dosageForm}</span>
                  <span className="badge text-[10px] bg-surface-100 dark:bg-surface-800 text-surface-500">{med.category}</span>
                  {med.prescriptionRequired && <span className="badge badge-warning text-[10px]">Rx</span>}
                  <span className={`badge text-[10px] ${med.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                    {med.status}
                  </span>
                </div>
                <p className="text-xs text-surface-500 truncate">{med.genericName} · {med.manufacturer}</p>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-brand-600">{formatCurrency(med.standardMrp)}</p>
              </div>

              <button onClick={() => openEdit(med)}
                className="p-2 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 text-brand-500 transition-colors opacity-0 group-hover:opacity-100">
                <HiOutlinePencil className="w-4 h-4" />
              </button>
            </GlassCard>
          ))}

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {Array.from({ length: Math.min(pagination.pages, 10) }).map((_, i) => (
                <button key={i} onClick={() => fetchMedicines(i + 1)}
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

      {/* Add/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Medicine' : 'Add Medicine'} maxWidth="max-w-lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Brand Name *</label>
              <input value={form.brandName} onChange={(e) => set('brandName', e.target.value)} className="input-field" placeholder="e.g., Napa" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Generic Name *</label>
              <input value={form.genericName} onChange={(e) => set('genericName', e.target.value)} className="input-field" placeholder="e.g., Paracetamol" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Manufacturer</label>
            <input value={form.manufacturer} onChange={(e) => set('manufacturer', e.target.value)} className="input-field" placeholder="e.g., Beximco" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} className="input-field text-sm">
                {MEDICINE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Form</label>
              <select value={form.dosageForm} onChange={(e) => set('dosageForm', e.target.value)} className="input-field text-sm">
                {DOSAGE_FORMS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Strength</label>
              <input value={form.strength} onChange={(e) => set('strength', e.target.value)} className="input-field" placeholder="500mg" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">MRP (BDT)</label>
              <input type="number" step="0.01" value={form.standardMrp} onChange={(e) => set('standardMrp', e.target.value)} className="input-field" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => set('status', e.target.value)} className="input-field text-sm">
                <option>Active</option>
                <option>Discontinued</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} className="input-field resize-none" rows={2} placeholder="What it treats..." />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Image URL</label>
            <input value={form.imageUrl} onChange={(e) => set('imageUrl', e.target.value)} className="input-field" placeholder="https://..." />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.prescriptionRequired} onChange={(e) => set('prescriptionRequired', e.target.checked)}
              className="w-4 h-4 rounded border-surface-300 text-brand-500 focus:ring-brand-500" />
            <span className="text-sm font-medium">Prescription Required</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-surface-200/50 dark:border-surface-700/30">
          <button onClick={() => setShowModal(false)} className="btn-secondary text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-emerald text-sm">
            {saving ? 'Saving...' : editingId ? 'Update Medicine' : 'Add Medicine'}
          </button>
        </div>
      </Modal>

      {/* Quick Add Modal */}
      <Modal open={showQuickAdd} onClose={() => setShowQuickAdd(false)} title="⚡ Quick Add Medicines" maxWidth="max-w-4xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input 
                value={quickAddSearch} 
                onChange={(e) => setQuickAddSearch(e.target.value)} 
                placeholder="Search medicines to quick add..." 
                className="input-field pl-11" 
              />
            </div>
            <button onClick={fetchQuickAddMedicines} className="btn-secondary text-sm" title="Refresh list">
              🔄
            </button>
          </div>

          {loadingQuickAdd ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            </div>
          ) : quickAddMedicines.length === 0 ? (
            <GlassCard className="text-center py-12">
              <p className="text-3xl mb-2">✅</p>
              <p className="text-surface-500">All medicines have been added!</p>
              <p className="text-xs text-surface-400 mt-2">Use the manual form to add custom medicines.</p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {filteredQuickAdd.map((med) => (
                <GlassCard key={med.brandName + med.strength} className="flex flex-col gap-2 p-4 hover:border-brand-500/30 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-sm">{med.brandName}</h3>
                    <p className="text-xs text-surface-500">{med.genericName}</p>
                    <p className="text-xs text-surface-400 mt-1">{med.strength} · {med.dosageForm}</p>
                    <p className="text-xs text-surface-400">{med.manufacturer}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-200/50 dark:border-surface-700/30">
                    <span className="text-sm font-semibold text-brand-600">{formatCurrency(med.standardMrp)}</span>
                    <button 
                      onClick={() => quickAddMedicine(med)}
                      disabled={saving}
                      className="btn-emerald text-xs px-3 py-1.5"
                    >
                      <HiOutlineDownload className="w-3 h-3" /> Add
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-200/50 dark:border-surface-700/30">
            <button onClick={() => setShowQuickAdd(false)} className="btn-secondary text-sm">Close</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
