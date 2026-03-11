import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Calendar, 
  User, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface Subscription {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  plan_id: string;
  status: string;
  trial_end: string;
  next_billing_date: string;
}

export const SubscriptionManagement: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/admin/subscriptions', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setSubscriptions(data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(s => 
    s.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.user_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Subscription Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-brand-pink shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 shadow-lg shadow-emerald-600/5">
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Retention Rate</h3>
            <p className="text-3xl font-bold text-slate-900 mt-1">94.2%</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-brand-pink shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-brand-pink text-brand-accent shadow-lg shadow-brand-accent/5">
              <CreditCard size={24} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Monthly Recurring Revenue</h3>
            <p className="text-3xl font-bold text-slate-900 mt-1">$8,450.00</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-brand-pink shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 shadow-lg shadow-purple-600/5">
              <Calendar size={24} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Upcoming Renewals (7d)</h3>
            <p className="text-3xl font-bold text-slate-900 mt-1">42</p>
          </div>
        </div>
      </div>

      {/* Subscription List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Active Subscriptions</h3>
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
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subscriber</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Plan</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Trial Ends</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Next Billing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-pink/30">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">Loading subscriptions...</td></tr>
                ) : filteredSubscriptions.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">No subscriptions found</td></tr>
                ) : filteredSubscriptions.map((s) => (
                  <tr key={s.id} className="hover:bg-brand-pink/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-xl bg-brand-purple flex items-center justify-center text-brand-accent font-bold mr-3 text-xs shadow-sm">
                          {s.user_name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{s.user_name}</div>
                          <div className="text-xs text-slate-400 font-medium">{s.user_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-600 capitalize bg-slate-100 px-3 py-1 rounded-full">
                        {s.plan_id.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {s.trial_end ? new Date(s.trial_end).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 font-bold">
                      {new Date(s.next_billing_date).toLocaleDateString()}
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
