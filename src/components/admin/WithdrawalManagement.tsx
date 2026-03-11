import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter,
  ArrowRight,
  User,
  DollarSign
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

export const WithdrawalManagement: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

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

  const filteredWithdrawals = withdrawals.filter(w => {
    const matchesSearch = w.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         w.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || w.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
          <input
            type="text"
            placeholder="Search by user name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
        <div className="flex items-center space-x-2">
          {['all', 'pending', 'approved', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                filter === f 
                  ? 'bg-stone-900 text-white' 
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Request ID</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-stone-500">Loading requests...</td></tr>
              ) : filteredWithdrawals.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-stone-500">No requests found</td></tr>
              ) : filteredWithdrawals.map((w) => (
                <tr key={w.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-stone-400">#WDR-{w.id.toString().padStart(4, '0')}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 font-bold mr-3 text-xs">
                        {w.user_name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-stone-900">{w.user_name}</div>
                        <div className="text-xs text-stone-500">{w.user_email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-stone-900">${w.amount.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-500">
                    {new Date(w.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
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
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleAction(w.id, 'reject')}
                          className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-all"
                        >
                          Reject
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
  );
};
