import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { HiOutlineBell, HiOutlineMoon, HiOutlineSun, HiOutlineMenu, HiOutlineSearch } from 'react-icons/hi';
import { logout } from '../../store/slices/authSlice';
import { fetchNotifications, markAllRead } from '../../store/slices/notificationSlice';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/helpers';

export default function Navbar({ darkMode, setDarkMode, onMenuToggle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { unreadCount, items: notifications } = useSelector((s) => s.notifications);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    if (user) dispatch(fetchNotifications({ limit: 5 }));
  }, [dispatch, user]);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const dashboardPath = user?.role === 'storeOwner' ? '/store' : user?.role === 'admin' ? '/admin' : '/patient';

  return (
    <header className="sticky top-0 z-50 glass border-b border-surface-200/50 dark:border-surface-700/30">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button onClick={onMenuToggle} className="lg:hidden p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
            <HiOutlineMenu className="w-5 h-5" />
          </button>
          <Link to={dashboardPath} className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center shadow-neon group-hover:shadow-neon-emerald transition-shadow duration-500">
              <span className="text-white font-display font-extrabold text-sm">P</span>
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-500 opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-500" />
            </div>
            <span className="hidden sm:block font-display font-bold text-lg tracking-tight">
              <span className="gradient-text">pharma</span>
              <span className="text-surface-700 dark:text-surface-300">Assist</span>
            </span>
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-200 active:scale-95"
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode
              ? <HiOutlineSun className="w-5 h-5 text-amber-400" />
              : <HiOutlineMoon className="w-5 h-5 text-surface-500" />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-200 active:scale-95"
            >
              <HiOutlineBell className="w-5 h-5 text-surface-500" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4.5 h-4.5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full ring-2 ring-white dark:ring-surface-900 animate-scale-in">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-strong rounded-2xl shadow-glass-lg overflow-hidden animate-slide-down z-50">
                <div className="flex items-center justify-between p-4 border-b border-surface-200/50 dark:border-surface-700/30">
                  <h3 className="font-display font-semibold text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={() => dispatch(markAllRead())} className="text-xs font-medium text-brand-500 hover:text-brand-600 transition-colors">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-surface-100 dark:divide-surface-800">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-surface-400 text-sm">No notifications yet</div>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <div key={n._id} className={`p-3.5 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors ${!n.read ? 'bg-brand-50/30 dark:bg-brand-900/10' : ''}`}>
                        <p className="text-sm font-medium line-clamp-2">{n.title}</p>
                        <p className="text-xs text-surface-500 mt-1 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-emerald-500 flex items-center justify-center text-white font-bold text-xs shadow-inner-glow">
                {getInitials(user?.fullName)}
              </div>
              <span className="hidden md:block text-sm font-medium truncate max-w-[120px]">{user?.fullName}</span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 glass-strong rounded-2xl shadow-glass-lg overflow-hidden animate-slide-down z-50">
                <div className="p-3 border-b border-surface-200/50 dark:border-surface-700/30">
                  <p className="font-semibold text-sm truncate">{user?.fullName}</p>
                  <p className="text-xs text-surface-500 truncate">{user?.email}</p>
                  <span className="badge badge-info mt-1.5 text-[10px]">{user?.role === 'storeOwner' ? 'Store Owner' : user?.role}</span>
                </div>
                <div className="py-1.5">
                  <Link to={`${dashboardPath}`} onClick={() => setShowProfileMenu(false)} className="block px-4 py-2 text-sm hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">Dashboard</Link>
                  <Link to={`${dashboardPath}/settings`} onClick={() => setShowProfileMenu(false)} className="block px-4 py-2 text-sm hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">Settings</Link>
                </div>
                <div className="border-t border-surface-200/50 dark:border-surface-700/30 py-1.5">
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">Sign Out</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}