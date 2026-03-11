import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  UserCheck, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell
} from 'recharts';

interface Stats {
  totalUsers: number;
  activeSubscriptions: number;
  trialUsers: number;
  totalPayouts: number;
  totalRevenue: number;
  pendingWithdrawals: number;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64">Loading stats...</div>;

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'bg-brand-accent', trend: '+12%' },
    { label: 'Active Subscriptions', value: stats?.activeSubscriptions || 0, icon: UserCheck, color: 'bg-purple-500', trend: '+5%' },
    { label: 'Total Revenue', value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-fuchsia-500', trend: '+18%' },
    { label: 'Pending Withdrawals', value: stats?.pendingWithdrawals || 0, icon: Clock, color: 'bg-violet-500', trend: '-2%' },
  ];

  // Mock chart data
  const chartData = [
    { name: 'Mon', users: 40, revenue: 2400 },
    { name: 'Tue', users: 30, revenue: 1398 },
    { name: 'Wed', users: 20, revenue: 9800 },
    { name: 'Thu', users: 27, revenue: 3908 },
    { name: 'Fri', users: 18, revenue: 4800 },
    { name: 'Sat', users: 23, revenue: 3800 },
    { name: 'Sun', users: 34, revenue: 4300 },
  ];

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-brand-pink shadow-sm hover:shadow-xl hover:shadow-brand-accent/5 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-2xl ${card.color} text-white shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
                <card.icon size={24} />
              </div>
              <div className={`flex items-center text-xs font-bold ${card.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                {card.trend}
                {card.trend.startsWith('+') ? <ArrowUpRight size={14} className="ml-1" /> : <ArrowDownRight size={14} className="ml-1" />}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">{card.label}</h3>
              <p className="text-3xl font-bold text-slate-900 mt-1">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-brand-pink shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900">User Growth</h3>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-brand-accent"></span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">New Users</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D946EF" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#D946EF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  cursor={{ stroke: '#D946EF', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="users" stroke="#D946EF" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-brand-pink shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900">Revenue Overview</h3>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-purple-500"></span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Revenue ($)</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  cursor={{ fill: '#fdf2f8' }}
                />
                <Bar dataKey="revenue" fill="#A855F7" radius={[8, 8, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl border border-brand-pink shadow-sm overflow-hidden">
        <div className="p-6 border-b border-brand-pink flex items-center justify-between bg-brand-pink/20">
          <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
          <button className="text-brand-accent text-xs font-bold uppercase tracking-widest hover:underline">View All</button>
        </div>
        <div className="divide-y divide-brand-pink/30">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 flex items-center hover:bg-brand-pink/10 transition-colors">
              <div className="h-10 w-10 rounded-2xl bg-brand-purple flex items-center justify-center text-brand-accent mr-4">
                <Activity size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">New user registered: user_{i}@example.com</p>
                <p className="text-xs text-slate-400 font-medium mt-1">{i} hour{i > 1 ? 's' : ''} ago</p>
              </div>
              <div className="text-[10px] font-bold px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full uppercase tracking-wider">
                Success
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
