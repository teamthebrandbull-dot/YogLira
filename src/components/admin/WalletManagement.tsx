import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { motion } from 'motion/react';

interface Withdrawal {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  amount: number;
  status: string;
  created_at: string;
}

export const WalletManagement: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const response = await fetch('/api/admin/withdrawals', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setWithdrawals(data);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/admin/withdrawals/${id}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        fetchWithdrawals();
      }
    } catch (error) {
      console.error(`Error ${action}ing withdrawal:`, error);
    }
  };

  const filteredWithdrawals = withdrawals.filter(w => 
    w.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.user_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Financial Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-brand-pink shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-brand-pink text-brand-accent shadow-lg shadow-brand-accent/5">
              <DollarSign size={24} />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">+12.5%</span>
          </div>
          <div className="mt-4">
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Total Payouts</h3>
            <p className="text-3xl font-bold text-slate-900 mt-1">$12,450.00</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-brand-pink shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 shadow-lg shadow-purple-600/5">
              <Clock size={24} />
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">5 Pending</span>
          </div>
          <div className="mt-4">
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Pending Payouts</h3>
            <p className="text-3xl font-bold text-slate-900 mt-1">$1,200.00</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-brand-pink shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-fuchsia-50 text-fuchsia-600 shadow-lg shadow-fuchsia-600/5">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Active</span>
          </div>
          <div className="mt-4">
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Average Payout</h3>
            <p className="text-3xl font-bold text-slate-900 mt-1">$245.00</p>
          </div>
        </div>
      </div>

      {/* Withdrawal Requests Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Withdrawal Requests</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-brand-pink rounded-2xl focus:ring-2 focus:ring-brand-accent/20 outline-none text-sm font-medium"
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-brand-pink shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-pink/20 border-b border-brand-pink">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-pink/30">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">Loading requests...</td></tr>
                ) : filteredWithdrawals.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">No withdrawal requests found</td></tr>
                ) : filteredWithdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-brand-pink/10 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-bold text-slate-900">{w.user_name}</div>
                        <div className="text-xs text-slate-400 font-medium">{w.user_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900">${w.amount.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {new Date(w.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        w.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        w.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {w.status === 'pending' && (
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleAction(w.id, 'approve')}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                            title="Approve"
                          >
                            <CheckCircle size={20} />
                          </button>
                          <button 
                            onClick={() => handleAction(w.id, 'reject')}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Reject"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
