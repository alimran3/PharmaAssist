import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  HiOutlineHome, HiOutlineSearch, HiOutlineDocumentText, HiOutlineHeart,
  HiOutlineArchive, HiOutlinePlusCircle,
  HiOutlineReceiptTax, HiOutlineChartBar, HiOutlineCog,
  HiOutlineOfficeBuilding, HiOutlineUsers, HiOutlineBeaker,
} from 'react-icons/hi';

const patientLinks = [
  { to: '/patient', icon: HiOutlineHome, label: 'Dashboard', end: true },
  { to: '/patient/search', icon: HiOutlineSearch, label: 'Find Medicine' },
  { to: '/patient/purchases', icon: HiOutlineReceiptTax, label: 'Purchase History' },
  { to: '/patient/health', icon: HiOutlineHeart, label: 'Health Vitals' },
  { to: '/patient/prescriptions', icon: HiOutlineDocumentText, label: 'Prescriptions' },
  { to: '/patient/settings', icon: HiOutlineCog, label: 'Settings' },
];

const storeLinks = [
  { to: '/store', icon: HiOutlineHome, label: 'Dashboard', end: true },
  { to: '/store/inventory', icon: HiOutlineArchive, label: 'Inventory' },
  { to: '/store/add-medicine', icon: HiOutlinePlusCircle, label: 'Add Medicine' },
  { to: '/store/billing', icon: HiOutlineReceiptTax, label: 'Create Bill' },
  { to: '/store/analytics', icon: HiOutlineChartBar, label: 'Analytics' },
  { to: '/store/settings', icon: HiOutlineCog, label: 'Settings' },
];

const adminLinks = [
  { to: '/admin', icon: HiOutlineHome, label: 'Dashboard', end: true },
  { to: '/admin/pharmacies', icon: HiOutlineOfficeBuilding, label: 'Pharmacies' },
  { to: '/admin/patients', icon: HiOutlineUsers, label: 'Patients' },
  { to: '/admin/medicines', icon: HiOutlineBeaker, label: 'Medicine DB' },
  { to: '/admin/settings', icon: HiOutlineCog, label: 'Settings' },
];

export default function Sidebar({ open, onClose }) {
  const { isStoreOwner, isPatient, isAdmin } = useAuth();
  const links = isAdmin ? adminLinks : isStoreOwner ? storeLinks : isPatient ? patientLinks : [];

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64
        glass-strong border-r border-surface-200/50 dark:border-surface-700/30
        transform transition-transform duration-300 ease-out
        lg:translate-x-0 lg:static lg:z-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <nav className="flex flex-col h-full p-4">
          <div className="flex-1 space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 group
                  ${isActive
                    ? 'bg-gradient-to-r from-brand-500/10 to-emerald-500/5 text-brand-600 dark:text-brand-400 shadow-sm border border-brand-500/10'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800/80 hover:text-surface-900 dark:hover:text-surface-100'
                  }
                `}
              >
                <link.icon className="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Bottom section */}
          <div className="pt-4 border-t border-surface-200/50 dark:border-surface-700/30">
            <div className="p-3 rounded-xl bg-gradient-to-br from-brand-500/5 to-emerald-500/5 border border-brand-500/10">
              <p className="text-xs font-display font-semibold gradient-text">PharmaAssist v1.0</p>
              <p className="text-[10px] text-surface-500 mt-0.5">Your Neighborhood Pharmacy, Now Digital</p>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}