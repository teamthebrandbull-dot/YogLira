import React, { useState, useEffect } from 'react';
import { 
  Users, 
  LayoutDashboard, 
  Wallet, 
  Video, 
  CreditCard, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  TrendingUp,
  DollarSign,
  UserCheck,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AdminDashboard } from './AdminDashboard';
import { UserManagement } from './UserManagement';
import { WalletManagement } from './WalletManagement';
import { CourseManagement } from './CourseManagement';
import { SubscriptionManagement } from './SubscriptionManagement';
import { WithdrawalManagement } from './WithdrawalManagement';
import { SettingsManagement } from './SettingsManagement';
import { Settings } from 'lucide-react';

interface AdminPanelProps {
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'wallet', label: 'Wallet & Payouts', icon: Wallet },
    { id: 'withdrawals', label: 'Withdrawal Requests', icon: Clock },
    { id: 'courses', label: 'Courses', icon: Video },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <AdminDashboard />;
      case 'users': return <UserManagement />;
      case 'wallet': return <WalletManagement />;
      case 'withdrawals': return <WithdrawalManagement />;
      case 'courses': return <CourseManagement />;
      case 'subscriptions': return <SubscriptionManagement />;
      case 'settings': return <SettingsManagement />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-stone-50 font-sans">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 relative z-50 shadow-2xl"
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-serif font-bold bg-gradient-to-r from-brand-accent to-purple-400 bg-clip-text text-transparent tracking-tight"
            >
              YogLira Admin
            </motion.span>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center p-3 rounded-xl transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-gradient-to-r from-brand-accent to-purple-600 text-white shadow-lg shadow-brand-accent/20' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'mr-3' : (isSidebarOpen ? 'mr-3' : 'mx-auto')} />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
              {isSidebarOpen && activeTab === item.id && (
                <motion.div layoutId="activeTab" className="ml-auto">
                  <ChevronRight size={16} />
                </motion.div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center p-3 rounded-xl text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-all duration-200"
          >
            <LogOut size={20} className={isSidebarOpen ? 'mr-3' : 'mx-auto'} />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-brand-pink/30">
        <header className="bg-white/80 backdrop-blur-md border-b border-brand-pink h-16 flex items-center px-8 sticky top-0 z-40">
          <h2 className="text-lg font-bold text-slate-800 capitalize flex items-center gap-2">
            <div className="w-1.5 h-6 bg-brand-accent rounded-full"></div>
            {activeTab.replace('-', ' ')}
          </h2>
          <div className="ml-auto flex items-center space-x-4">
            <div className="text-sm text-slate-500 font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-brand-accent to-purple-500 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-accent/20">
              A
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
