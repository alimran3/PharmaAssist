import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  HiOutlineSearch, HiOutlineLocationMarker, HiOutlineShieldCheck,
  HiOutlineDocumentReport, HiOutlineHeart, HiOutlineLightningBolt,
  HiOutlineMoon, HiOutlineSun,
} from 'react-icons/hi';

const features = [
  { icon: HiOutlineSearch, title: 'Smart Medicine Search', desc: 'Fuzzy search across thousands of medicines. Even typos find results.', color: 'from-brand-500 to-blue-500' },
  { icon: HiOutlineLocationMarker, title: 'Location-Based Discovery', desc: 'Find medicines available at pharmacies near your area in real time.', color: 'from-emerald-500 to-teal-500' },
  { icon: HiOutlineShieldCheck, title: 'Drug Conflict Detection', desc: 'Real-time allergy, drug-interaction, and condition conflict alerts.', color: 'from-red-500 to-pink-500' },
  { icon: HiOutlineDocumentReport, title: 'Auto Purchase History', desc: 'Every purchase is recorded. Build your complete medicine timeline.', color: 'from-amber-500 to-orange-500' },
  { icon: HiOutlineHeart, title: 'Health Vitals Tracking', desc: 'Log BP, sugar, heart rate, BMI. Get alerts when readings are abnormal.', color: 'from-purple-500 to-violet-500' },
  { icon: HiOutlineLightningBolt, title: 'POS & Billing System', desc: 'Store owners generate PDF bills, auto-decrement stock, manage inventory.', color: 'from-cyan-500 to-blue-500' },
];

export default function Landing({ darkMode, setDarkMode }) {
  const { isAuthenticated, user } = useAuth();
  const dashPath = user?.role === 'storeOwner' ? '/store' : '/patient';

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Mesh background decoration */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-brand-500/[0.07] blur-[120px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-emerald-500/[0.06] blur-[100px] translate-y-1/3 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full bg-purple-500/[0.04] blur-[80px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 glass border-b border-surface-200/50 dark:border-surface-700/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center shadow-neon">
              <span className="text-white font-display font-extrabold text-sm">P</span>
            </div>
            <span className="font-display font-bold text-xl tracking-tight">
              <span className="gradient-text">pharma</span>
              <span className="text-surface-700 dark:text-surface-300">Assist</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
              {darkMode ? <HiOutlineSun className="w-5 h-5 text-amber-400" /> : <HiOutlineMoon className="w-5 h-5 text-surface-500" />}
            </button>
            {isAuthenticated ? (
              <Link to={dashPath} className="btn-primary text-sm">Dashboard →</Link>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-semibold text-brand-600 dark:text-brand-400 mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Your Neighborhood Pharmacy, Now Digital
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight animate-slide-up">
            <span className="text-surface-900 dark:text-white">Find Medicine.</span>
            <br />
            <span className="gradient-text">Stay Healthy.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-surface-600 dark:text-surface-400 max-w-2xl mx-auto text-balance animate-slide-up animation-delay-200">
            Connect with nearby pharmacies, discover medicines instantly, track your health vitals, and build a lifelong digital health record — all in one platform.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animation-delay-400">
            <Link to="/register" className="btn-primary text-base px-8 py-3.5 rounded-2xl shadow-xl shadow-brand-500/20">
              Start Free — It's Instant
            </Link>
            <Link to="/register?role=store" className="btn-secondary text-base px-8 py-3.5 rounded-2xl">
              Register Your Pharmacy
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto animate-fade-in animation-delay-600">
            {[
              { label: 'Medicines', value: '5,000+' },
              { label: 'Pharmacies', value: '500+' },
              { label: 'Patients', value: '10,000+' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-display font-extrabold gradient-text">{stat.value}</p>
                <p className="text-xs text-surface-500 mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Floating 3D cards - decorative */}
        <div className="hidden lg:block absolute top-32 -left-8 perspective-1000 animate-float">
          <div className="w-44 h-28 glass rounded-2xl p-3 rotate-y-neg-6 shadow-glass-lg">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500 mb-2">💊</div>
            <div className="h-2 w-20 bg-surface-200 dark:bg-surface-700 rounded" />
            <div className="h-2 w-14 bg-surface-100 dark:bg-surface-800 rounded mt-1.5" />
          </div>
        </div>
        <div className="hidden lg:block absolute top-48 -right-4 perspective-1000 animate-float animation-delay-400">
          <div className="w-44 h-28 glass rounded-2xl p-3 rotate-y-6 shadow-glass-lg">
            <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-500 mb-2">🏥</div>
            <div className="h-2 w-24 bg-surface-200 dark:bg-surface-700 rounded" />
            <div className="h-2 w-16 bg-surface-100 dark:bg-surface-800 rounded mt-1.5" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-surface-900 dark:text-white">
            Everything You Need
          </h2>
          <p className="mt-3 text-surface-500 max-w-xl mx-auto">
            A complete ecosystem for patients and pharmacy owners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div key={i} className="glass rounded-2xl p-6 card-hover group relative overflow-hidden">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display font-bold text-lg text-surface-900 dark:text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-surface-500 leading-relaxed">{f.desc}</p>
              <div className={`absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-gradient-to-br ${f.color} opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500`} />
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-surface-200/50 dark:border-surface-700/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-surface-500">© 2025 PharmaAssist. Your Neighborhood Pharmacy, Now Digital.</p>
          <div className="flex items-center gap-6 text-sm text-surface-500">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}