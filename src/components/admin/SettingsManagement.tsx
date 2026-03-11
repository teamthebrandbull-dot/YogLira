import React, { useState, useEffect } from 'react';
import { Save, Shield, CreditCard, Globe, Key } from 'lucide-react';
import { motion } from 'motion/react';

export const SettingsManagement: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    icici_merchant_id: '',
    icici_key: '',
    stripe_publishable_key: '',
    stripe_secret_key: '',
    payment_gateway: 'icici'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400 font-medium italic">Loading settings...</div>;
  }

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <header className="flex items-center gap-4">
        <div className="w-1.5 h-10 bg-brand-accent rounded-full"></div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">System Settings</h2>
          <p className="text-slate-500 font-medium">Configure payment gateways and global application parameters.</p>
        </div>
      </header>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl text-sm font-bold shadow-sm ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Payment Gateway Selection */}
        <section className="bg-white p-8 rounded-[2rem] border border-brand-pink space-y-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-brand-pink text-brand-accent shadow-lg shadow-brand-accent/5">
              <CreditCard size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Active Payment Gateway</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setSettings({ ...settings, payment_gateway: 'icici' })}
              className={`p-6 rounded-3xl border-2 transition-all text-left group ${
                settings.payment_gateway === 'icici' 
                  ? 'border-brand-accent bg-brand-pink/30 shadow-lg shadow-brand-accent/5' 
                  : 'border-slate-50 bg-slate-50/50 hover:border-brand-pink hover:bg-white'
              }`}
            >
              <p className={`font-bold text-lg ${settings.payment_gateway === 'icici' ? 'text-brand-accent' : 'text-slate-900'}`}>ICICI Bank</p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Mock/Standard integration</p>
            </button>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, payment_gateway: 'stripe' })}
              className={`p-6 rounded-3xl border-2 transition-all text-left group ${
                settings.payment_gateway === 'stripe' 
                  ? 'border-brand-accent bg-brand-pink/30 shadow-lg shadow-brand-accent/5' 
                  : 'border-slate-50 bg-slate-50/50 hover:border-brand-pink hover:bg-white'
              }`}
            >
              <p className={`font-bold text-lg ${settings.payment_gateway === 'stripe' ? 'text-brand-accent' : 'text-slate-900'}`}>Stripe</p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Global card payments</p>
            </button>
          </div>
        </section>

        {/* ICICI Config */}
        {settings.payment_gateway === 'icici' && (
          <section className="bg-white p-8 rounded-[2rem] border border-brand-pink space-y-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 shadow-lg shadow-blue-600/5">
                <Shield size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">ICICI Gateway Configuration</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Merchant ID</label>
                <input 
                  type="text"
                  value={settings.icici_merchant_id || ''}
                  onChange={(e) => setSettings({ ...settings, icici_merchant_id: e.target.value })}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-brand-pink focus:ring-2 focus:ring-brand-accent/20 outline-none font-medium transition-all"
                  placeholder="Enter ICICI Merchant ID"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Secret Key</label>
                <input 
                  type="password"
                  value={settings.icici_key || ''}
                  onChange={(e) => setSettings({ ...settings, icici_key: e.target.value })}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-brand-pink focus:ring-2 focus:ring-brand-accent/20 outline-none font-medium transition-all"
                  placeholder="••••••••••••••••"
                />
              </div>
            </div>
          </section>
        )}

        {/* Stripe Config */}
        {settings.payment_gateway === 'stripe' && (
          <section className="bg-white p-8 rounded-[2rem] border border-brand-pink space-y-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 shadow-lg shadow-purple-600/5">
                <Globe size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Stripe Configuration</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Publishable Key</label>
                <input 
                  type="text"
                  value={settings.stripe_publishable_key || ''}
                  onChange={(e) => setSettings({ ...settings, stripe_publishable_key: e.target.value })}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-brand-pink focus:ring-2 focus:ring-brand-accent/20 outline-none font-medium transition-all"
                  placeholder="pk_test_..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Secret Key</label>
                <input 
                  type="password"
                  value={settings.stripe_secret_key || ''}
                  onChange={(e) => setSettings({ ...settings, stripe_secret_key: e.target.value })}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-brand-pink focus:ring-2 focus:ring-brand-accent/20 outline-none font-medium transition-all"
                  placeholder="sk_test_..."
                />
              </div>
            </div>
          </section>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-3 px-10 py-5 bg-brand-accent text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-brand-accent/30 transition-all disabled:opacity-50 active:scale-95"
          >
            {saving ? 'Saving...' : (
              <>
                <Save size={20} />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
