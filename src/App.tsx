import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { 
  Home, 
  Search, 
  Wallet, 
  User, 
  Plus, 
  MessageCircle,
  ChevronRight, 
  Play, 
  Flame, 
  Clock, 
  Trophy,
  CreditCard,
  Share2,
  LogOut,
  Settings,
  CheckCircle2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Heart,
  Pause,
  Info,
  Maximize,
  Send,
  Sparkles,
  HelpCircle,
  Shield,
  Bell,
  Lock,
  Flower2,
  Wind,
  AlarmClock,
  Volume2,
  VolumeX,
  Camera,
  Scan
} from 'lucide-react';
import { PoseDetectionOverlay } from './components/PoseDetectionOverlay';
import { cn } from './lib/utils';

import { AdminPanel } from './components/admin/AdminPanel';

// --- Types ---
interface UserData {
  id: number;
  name: string;
  email: string;
  referralCode: string;
  subscriptionStatus: string;
  role: string;
  age?: number;
  country?: string;
  address?: string;
  mobile?: string;
  profilePicture?: string;
  twoFactorEnabled?: boolean;
  preferences?: {
    publicProfile: boolean;
    shareActivity: boolean;
    dataAnalytics: boolean;
    dailyReminders: boolean;
    challengeUpdates: boolean;
    newCourses: boolean;
    promotions: boolean;
    aiPersonality: string;
    aiFocusAreas: string[];
  };
}

// --- Components ---

const Button = ({ children, className, variant = 'primary', ...props }: any) => {
  const variants = {
    primary: 'bg-brand-accent text-white hover:bg-brand-accent/90',
    secondary: 'bg-white text-brand-accent border border-brand-accent/20 hover:bg-brand-pink',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
  };
  return (
    <button 
      className={cn(
        'px-6 py-3 rounded-2xl font-semibold transition-all active:scale-95 disabled:opacity-50',
        variants[variant as keyof typeof variants],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className }: any) => (
  <div className={cn('bg-white rounded-3xl p-6 shadow-sm border border-slate-100', className)}>
    {children}
  </div>
);

const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      'flex flex-col items-center gap-1 transition-colors',
      active ? 'text-brand-accent' : 'text-slate-400'
    )}
  >
    <Icon size={24} />
    <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
  </button>
);

// --- Screens ---

const LoginScreen = ({ onLogin, onForgotPassword }: any) => {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    referralCode: '',
    age: '',
    country: '',
    address: '',
    mobile: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        onLogin(data.user);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 justify-center bg-gradient-to-b from-brand-pink to-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="w-20 h-20 bg-brand-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Flame className="text-brand-accent" size={40} />
        </div>
        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">YogLira</h1>
        <p className="text-slate-500">Your AI-Powered Yoga Journey</p>
      </motion.div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <input 
                type="text" 
                placeholder="Full Name" 
                className="w-full p-4 rounded-2xl bg-white border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" 
                  placeholder="Age" 
                  className="w-full p-4 rounded-2xl bg-white border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                  value={formData.age}
                  onChange={e => setFormData({...formData, age: e.target.value})}
                  required
                />
                <input 
                  type="text" 
                  placeholder="Mobile Number" 
                  className="w-full p-4 rounded-2xl bg-white border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                  value={formData.mobile}
                  onChange={e => setFormData({...formData, mobile: e.target.value})}
                  required
                />
              </div>
              <input 
                type="text" 
                placeholder="Country" 
                className="w-full p-4 rounded-2xl bg-white border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                value={formData.country}
                onChange={e => setFormData({...formData, country: e.target.value})}
                required
              />
              <textarea 
                placeholder="Address" 
                className="w-full p-4 rounded-2xl bg-white border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 min-h-[80px]"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                required
              />
            </>
          )}
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full p-4 rounded-2xl bg-white border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-4 rounded-2xl bg-white border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
            required
          />
          {isRegister && (
            <input 
              type="text" 
              placeholder="Referral Code (Optional)" 
              className="w-full p-4 rounded-2xl bg-white border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
              value={formData.referralCode}
              onChange={e => setFormData({...formData, referralCode: e.target.value})}
            />
          )}
          {!isRegister && (
            <div className="flex justify-end">
              <button 
                type="button"
                onClick={onForgotPassword}
                className="text-brand-accent text-xs font-medium hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}
          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
          </Button>
        </form>
      </div>

      <button 
        onClick={() => setIsRegister(!isRegister)}
        className="mt-6 text-slate-500 text-sm font-medium hover:text-brand-accent"
      >
        {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
      </button>
    </div>
  );
};

const ForgotPasswordScreen = ({ onBack }: any) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 justify-center bg-gradient-to-b from-brand-pink to-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="w-20 h-20 bg-brand-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Lock className="text-brand-accent" size={40} />
        </div>
        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">Forgot Password</h1>
        <p className="text-slate-500">Enter your email to receive a reset link</p>
      </motion.div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm flex items-center gap-3">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email Address" 
            className="w-full p-4 rounded-2xl bg-white border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
      ) : (
        <Button onClick={onBack} className="w-full mt-4">
          Back to Login
        </Button>
      )}

      <button 
        onClick={onBack}
        className="mt-6 text-slate-500 text-sm font-medium hover:text-brand-accent flex items-center justify-center gap-2"
      >
        <ArrowLeft size={16} />
        Back to Sign In
      </button>
    </div>
  );
};

const ResetPasswordScreen = ({ token, onComplete }: any) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message);
        setTimeout(() => onComplete(), 3000);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 justify-center bg-gradient-to-b from-brand-pink to-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="w-20 h-20 bg-brand-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Shield className="text-brand-accent" size={40} />
        </div>
        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">Reset Password</h1>
        <p className="text-slate-500">Create a new secure password</p>
      </motion.div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm flex items-center gap-3">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="password" 
            placeholder="New Password" 
            className="w-full p-4 rounded-2xl bg-white border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <input 
            type="password" 
            placeholder="Confirm New Password" 
            className="w-full p-4 rounded-2xl bg-white border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      )}
    </div>
  );
};

const SubscriptionSelectionScreen = ({ onSelect }: any) => {
  const plans = [
    { id: 'monthly', name: 'Monthly', price: '$9.99', period: 'month', description: 'Perfect for getting started' },
    { id: 'annual', name: 'Annual', price: '$89.90', period: 'year', description: 'Best value - Save 25%', popular: true },
  ];

  return (
    <div className="flex-1 flex flex-col p-8 bg-white">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Choose Your Plan</h2>
        <p className="text-slate-500 text-sm">Select a subscription model to unlock your 7-day free trial and start your yoga journey.</p>
      </div>

      <div className="space-y-4">
        {plans.map((plan) => (
          <button
            key={plan.id}
            onClick={() => onSelect(plan)}
            className={cn(
              "w-full text-left p-6 rounded-3xl border-2 transition-all relative overflow-hidden",
              plan.popular ? "border-brand-accent bg-brand-pink/10" : "border-slate-100 bg-white hover:border-brand-accent/30"
            )}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-brand-accent text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                Most Popular
              </div>
            )}
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{plan.name}</h3>
                <p className="text-slate-500 text-xs">{plan.description}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-slate-900">{plan.price}</span>
                <span className="text-slate-400 text-xs">/{plan.period}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 text-brand-accent font-semibold text-sm">
              <span>Select Plan</span>
              <ChevronRight size={16} />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-auto pt-8 text-center">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">7-Day Free Trial Included with both plans</p>
      </div>
    </div>
  );
};

const PaymentSetupScreen = ({ user, plan, onComplete, onBack }: any) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ cardNumber: '', expiry: '', cvv: '' });

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/billing/icici/setup', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ ...formData, planId: plan.id })
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      onComplete();
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 bg-white">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors">
        <ChevronRight size={20} className="rotate-180" />
        <span className="text-sm font-medium">Back to Plans</span>
      </button>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider mb-4">
          <Trophy size={12} />
          7 Days Free Trial Included
        </div>
        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Setup Autopay</h2>
        <p className="text-slate-500 text-sm">
          You've selected the <span className="font-bold text-slate-900">{plan.name}</span> plan ({plan.price}/{plan.period}). 
          Connect your card to activate your trial.
        </p>
      </div>

      <Card className="bg-gradient-to-br from-slate-800 to-slate-950 text-white border-none mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-12">
            <div className="w-12 h-9 bg-amber-400/20 rounded-lg flex items-center justify-center">
              <div className="w-8 h-6 bg-gradient-to-br from-amber-300 to-amber-500 rounded-sm shadow-inner"></div>
            </div>
            <div className="text-right">
              <p className="text-[8px] uppercase tracking-[0.2em] opacity-50 mb-1">Payment Partner</p>
              <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/ICICI_Bank_Logo.svg" alt="ICICI" className="h-5 invert" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-2 w-full bg-white/5 rounded-full"></div>
            <div className="flex justify-between items-end">
              <div className="space-y-2">
                <div className="h-2 w-32 bg-white/10 rounded-full"></div>
                <div className="h-2 w-20 bg-white/5 rounded-full"></div>
              </div>
              <div className="flex gap-1">
                <div className="w-6 h-4 bg-white/10 rounded-sm"></div>
                <div className="w-6 h-4 bg-white/20 rounded-sm"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl"></div>
      </Card>

      <form onSubmit={handleSetup} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Card Number (Debit/Credit Only)</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="0000 0000 0000 0000" 
              className="w-full p-4 pl-12 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all"
              value={formData.cardNumber}
              onChange={e => setFormData({...formData, cardNumber: e.target.value})}
              required
            />
            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Expiry Date</label>
            <input 
              type="text" 
              placeholder="MM/YY" 
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all"
              value={formData.expiry}
              onChange={e => setFormData({...formData, expiry: e.target.value})}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">CVV / CVC</label>
            <input 
              type="password" 
              placeholder="***" 
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all"
              value={formData.cvv}
              onChange={e => setFormData({...formData, cvv: e.target.value})}
              required
            />
          </div>
        </div>
        <div className="pt-4">
          <Button type="submit" className="w-full shadow-lg shadow-brand-accent/20" disabled={loading}>
            {loading ? 'Verifying Card...' : 'Start My 7-Day Free Trial'}
          </Button>
        </div>
      </form>

      <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
        <p className="text-[11px] text-slate-500 leading-relaxed">
          <span className="font-bold text-slate-700">Note:</span> Your card will not be charged today. After your 7-day free trial ends, you will be automatically billed <span className="font-bold text-slate-900">{plan.price}/{plan.period}</span>. You can cancel anytime before the trial ends to avoid charges.
        </p>
      </div>
    </div>
  );
};

const VideoPlayerScreen = ({ video: initialVideo, onBack }: { video: any, onBack: () => void }) => {
  const [currentVideo, setCurrentVideo] = useState(initialVideo);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const playPromiseRef = React.useRef<Promise<void> | null>(null);
  const lastVideoUrlRef = React.useRef<string>("");

  const safePlay = async () => {
    if (videoRef.current) {
      try {
        playPromiseRef.current = videoRef.current.play();
        await playPromiseRef.current;
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error("Playback error:", error);
        }
      } finally {
        playPromiseRef.current = null;
      }
    }
  };

  const safePause = async () => {
    if (playPromiseRef.current) {
      try {
        await playPromiseRef.current;
      } catch (e) {}
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  useEffect(() => {
    let isCancelled = false;

    const sync = async () => {
      if (isCancelled || !videoRef.current) return;
      
      const newUrl = currentVideo.videoUrl || "";
      if (newUrl !== lastVideoUrlRef.current) {
        lastVideoUrlRef.current = newUrl;
        videoRef.current.load();
      }

      if (isPlaying) {
        await safePlay();
      } else {
        await safePause();
      }
    };

    sync();

    return () => {
      isCancelled = true;
    };
  }, [isPlaying, currentVideo]);

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const toggleFullScreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if ((videoRef.current as any).webkitRequestFullscreen) {
        (videoRef.current as any).webkitRequestFullscreen();
      } else if ((videoRef.current as any).msRequestFullscreen) {
        (videoRef.current as any).msRequestFullscreen();
      }
    }
  };

  const nextVideos = [
    { 
      title: 'Deep Stretch & Release', 
      dur: '15 min', 
      level: 'Beginner', 
      img: 'yoga-10', 
      instructor: 'Sarah J.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-practicing-yoga-in-the-mountains-40341-large.mp4'
    },
    { 
      title: 'Core Stability Flow', 
      dur: '20 min', 
      level: 'Intermediate', 
      img: 'yoga-11', 
      instructor: 'Michael R.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-yoga-in-the-park-40340-large.mp4'
    },
    { 
      title: 'Evening Wind Down', 
      dur: '10 min', 
      level: 'All Levels', 
      img: 'yoga-12', 
      instructor: 'Elena K.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-yoga-on-the-beach-40339-large.mp4'
    }
  ];

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-950 text-white relative overflow-hidden flex flex-col">
      {/* Video Header / Player Area */}
      <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group cursor-pointer" onClick={togglePlay}>
        <video 
          ref={videoRef}
          muted 
          loop 
          playsInline
          className="w-full h-full object-cover opacity-60"
          poster={`https://picsum.photos/seed/${currentVideo.img}/800/450`}
        >
          <source src={currentVideo.videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-woman-doing-yoga-on-a-mat-in-a-sunny-room-40342-large.mp4"} type="video/mp4" />
        </video>
        
        <div className={cn(
          "absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px] transition-opacity duration-300",
          isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
        )}>
          <div className="w-16 h-16 rounded-full bg-brand-accent/30 flex items-center justify-center backdrop-blur-xl border border-white/20 mb-3">
            {isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" className="ml-1" />}
          </div>
          <p className="text-white/80 text-xs font-bold tracking-widest uppercase">{isPlaying ? 'Playing' : 'Paused'}</p>
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); onBack(); }}
          className="absolute top-6 left-6 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 z-20 hover:bg-black/60 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); toggleFullScreen(); }}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 z-20 hover:bg-black/60 transition-colors"
        >
          <Maximize size={20} />
        </button>

        {/* Video Controls Overlay (Simplified) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-brand-accent transition-all duration-300"></div>
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-mono text-white/60">
            <span>04:20</span>
            <span>12:45</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold leading-tight">{currentVideo.title}</h2>
            <div className="flex items-center gap-2 text-white/40 text-xs font-medium">
              <span>{currentVideo.duration || currentVideo.sessions + ' Sessions'}</span>
              <span className="w-1 h-1 rounded-full bg-white/20"></span>
              <span>{currentVideo.level || currentVideo.instructor}</span>
            </div>
          </div>
          <button 
            onClick={() => setIsFavorited(!isFavorited)}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300",
              isFavorited ? "bg-brand-accent/20 border-brand-accent text-brand-accent" : "bg-white/5 border-white/10 text-white/60"
            )}
          >
            <Heart size={20} fill={isFavorited ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={togglePlay}
            className="flex-1 py-4 rounded-2xl bg-brand-accent text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-accent/20 active:scale-95 transition-transform"
          >
            {isPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" />} 
            {isPlaying ? 'Pause Session' : 'Resume Session'}
          </button>
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className={cn(
              "px-6 py-4 rounded-2xl font-bold border transition-colors",
              showDetails ? "bg-white/20 border-white/40 text-white" : "bg-white/5 border-white/10 text-white hover:bg-white/10"
            )}
          >
            Details
          </button>
        </div>

        {showDetails && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 text-sm text-white/70 leading-relaxed"
          >
            <div className="flex items-center gap-2 mb-2 text-white font-bold">
              <Info size={16} className="text-brand-accent" />
              About this session
            </div>
            This session focuses on mindful movement and breath synchronization. Perfect for {currentVideo.level || 'all levels'}, it helps in building core strength while maintaining mental clarity. Recommended for daily practice.
          </motion.div>
        )}

        <section className="pb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Up Next</h3>
            <span className="text-xs text-white/40 font-medium">{nextVideos.length} Sessions remaining</span>
          </div>
          <div className="space-y-3">
            {nextVideos.map((item, i) => (
              <div 
                key={i} 
                onClick={() => {
                  setCurrentVideo(item);
                  setIsPlaying(true);
                }}
                className="group flex gap-4 items-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer"
              >
                <div className="w-16 h-16 rounded-xl bg-slate-800 overflow-hidden shrink-0 relative">
                  <img 
                    src={`https://picsum.photos/seed/${item.img}/200/200`} 
                    alt="next" 
                    className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play size={14} fill="white" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate group-hover:text-brand-accent transition-colors">{item.title}</h4>
                  <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider">{item.dur} • {item.level}</p>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white/20 group-hover:text-brand-accent transition-colors">
                  <Play size={16} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const HomeScreen = ({ user, onPlay, onNavigate, unreadCount, reminder, onSetReminder }: { user: UserData, onPlay: (video: any) => void, onNavigate: (tab: string, subView?: string) => void, unreadCount: number, reminder: string | null, onSetReminder: (time: string | null) => void }) => {
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [tempTime, setTempTime] = useState(reminder || '08:00');

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
      <header className="flex justify-between items-center">
        <div className="cursor-pointer" onClick={() => onNavigate('profile')}>
          <p className="text-slate-400 text-sm font-medium">Hello {user.name}!</p>
          <h2 className="text-2xl font-bold text-slate-900">Level 2 <span className="text-brand-accent text-sm font-normal ml-2">2468 pts.</span></h2>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('notifications')}
            className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-brand-accent hover:bg-brand-pink transition-all relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-brand-accent text-white text-[8px] font-bold rounded-full border-2 border-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <div className="w-12 h-12 rounded-2xl bg-slate-200 overflow-hidden cursor-pointer active:scale-95 transition-transform" onClick={() => onNavigate('profile')}>
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="avatar" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        <Card className="bg-indigo-50 border-indigo-100 relative overflow-hidden group">
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                <AlarmClock size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Yoga Reminder</h3>
                <p className="text-xs text-slate-500">{reminder ? `Set for ${reminder}` : 'No reminder set'}</p>
              </div>
            </div>
            <button 
              onClick={() => setShowReminderPicker(true)}
              className="px-4 py-2 rounded-xl bg-white border border-indigo-100 text-indigo-600 text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
            >
              {reminder ? 'Change' : 'Set Alarm'}
            </button>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5 text-indigo-900 group-hover:scale-110 transition-transform">
            <AlarmClock size={80} />
          </div>
        </Card>
      </div>

      {showReminderPicker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-md bg-white rounded-3xl p-6 space-y-6 shadow-2xl"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Set Yoga Reminder</h3>
              <button onClick={() => setShowReminderPicker(false)} className="text-slate-400 hover:text-slate-600">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-slate-500">Pick a time for your daily yoga session. We'll play an alarm sound to remind you.</p>
              <input 
                type="time" 
                value={tempTime}
                onChange={(e) => setTempTime(e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-2xl font-bold text-center outline-none focus:ring-2 focus:ring-brand-accent/20"
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => { onSetReminder(null); setShowReminderPicker(false); }}
                className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-all"
              >
                Turn Off
              </button>
              <button 
                onClick={() => { onSetReminder(tempTime); setShowReminderPicker(false); }}
                className="flex-1 py-4 rounded-2xl bg-brand-accent text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-brand-accent/20"
              >
                Save Alarm
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <Card className="bg-gradient-to-br from-brand-accent to-purple-600 text-white border-none cursor-pointer hover:shadow-xl hover:shadow-brand-accent/20 transition-all" onClick={() => onNavigate('stats')}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-white/80 text-sm mb-1">Today's Goal</p>
            <h3 className="text-3xl font-bold">1468 <span className="text-lg font-normal opacity-80">Kcal</span></h3>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-white/20 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-[10px] font-bold">
              75%
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-4" onClick={(e) => { e.stopPropagation(); onNavigate('friends'); }}>
          <div className="flex -space-x-2">
            {[1,2,3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-brand-accent bg-slate-200 overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="friend" />
              </div>
            ))}
          </div>
          <p className="text-xs text-white/80">You & 3 friends had 2 challenges together</p>
        </div>
      </Card>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">Information</h3>
          <button className="text-slate-400 hover:text-brand-accent transition-colors" onClick={() => onNavigate('stats')}><ChevronRight size={20} /></button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Card className="flex flex-col items-center text-center cursor-pointer hover:bg-red-50/50 transition-colors" onClick={() => onNavigate('stats')}>
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-3">
              <Flame className="text-red-500" size={20} />
            </div>
            <p className="text-slate-400 text-xs mb-1">Calories</p>
            <p className="text-lg font-bold">736 <span className="text-xs font-normal">Kcal</span></p>
          </Card>
          <Card className="flex flex-col items-center text-center cursor-pointer hover:bg-blue-50/50 transition-colors" onClick={() => onNavigate('stats')}>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
              <Clock className="text-blue-500" size={20} />
            </div>
            <p className="text-slate-400 text-xs mb-1">Time</p>
            <p className="text-lg font-bold">45 <span className="text-xs font-normal">Mins</span></p>
          </Card>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">Featured Courses</h3>
          <button className="text-brand-accent text-xs font-bold uppercase tracking-wider hover:underline" onClick={() => onNavigate('courses')}>See All</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
          {[
            { title: 'Yoga for Beginners', sessions: 12, instructor: 'Sarah J.', img: 'yoga-1', color: 'bg-blue-500', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-yoga-on-a-mat-in-a-sunny-room-40342-large.mp4' },
            { title: 'Advanced Vinyasa', sessions: 8, instructor: 'Michael R.', img: 'yoga-2', color: 'bg-purple-500', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-practicing-yoga-in-the-mountains-40341-large.mp4' },
            { title: 'Mindful Meditation', sessions: 15, instructor: 'Elena K.', img: 'yoga-3', color: 'bg-emerald-500', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-yoga-in-the-park-40340-large.mp4' },
            { title: 'Power Strength', sessions: 10, instructor: 'David W.', img: 'yoga-4', color: 'bg-orange-500', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-yoga-on-the-beach-40339-large.mp4' },
          ].map((course, i) => (
            <div key={i} className="min-w-[240px] group cursor-pointer" onClick={() => onPlay(course)}>
              <div className={`relative h-40 rounded-3xl overflow-hidden mb-3 ${course.color}`}>
                <img 
                  src={`https://picsum.photos/seed/${course.img}/400/300`} 
                  alt={course.title} 
                  className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">{course.sessions} Sessions</p>
                  <h4 className="text-white font-bold text-lg leading-tight">{course.title}</h4>
                </div>
              </div>
              <div className="flex items-center gap-2 px-1">
                <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor}`} alt={course.instructor} />
                </div>
                <p className="text-slate-400 text-xs">{course.instructor}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Recommended for you</h3>
        <div className="space-y-4">
          {[
            { title: 'Morning Flow', duration: '20 min', level: 'Beginner', img: 'nature' },
            { title: 'Power Vinyasa', duration: '45 min', level: 'Intermediate', img: 'vibrant' },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-3xl bg-white border border-slate-100 items-center cursor-pointer" onClick={() => onPlay(item)}>
              <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden">
                <img src={`https://picsum.photos/seed/${item.img}/200/200`} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900">{item.title}</h4>
                <p className="text-slate-400 text-xs">{item.duration} • {item.level}</p>
              </div>
              <button className="w-10 h-10 rounded-full bg-brand-pink flex items-center justify-center text-brand-accent">
                <Play size={16} fill="currentColor" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const StatsScreen = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Statistics</h2>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-brand-pink border-none">
          <Flame className="text-brand-accent mb-2" size={24} />
          <p className="text-slate-500 text-xs">Total Calories</p>
          <p className="text-2xl font-bold text-slate-900">12,450</p>
        </Card>
        <Card className="bg-blue-50 border-none">
          <Clock className="text-blue-500 mb-2" size={24} />
          <p className="text-slate-500 text-xs">Total Hours</p>
          <p className="text-2xl font-bold text-slate-900">48.5</p>
        </Card>
      </div>

      <Card>
        <h3 className="font-bold text-slate-900 mb-4">Weekly Progress</h3>
        <div className="h-40 flex items-end justify-between gap-2">
          {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-brand-accent/20 rounded-t-lg relative overflow-hidden" 
                style={{ height: `${h}%` }}
              >
                <div className="absolute bottom-0 left-0 right-0 bg-brand-accent rounded-t-lg" style={{ height: '60%' }}></div>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <section>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Achievements</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Trophy, label: '7 Day Streak', color: 'text-yellow-500', bg: 'bg-yellow-50' },
            { icon: Flame, label: '500 Cal Burn', color: 'text-orange-500', bg: 'bg-orange-50' },
            { icon: CheckCircle2, label: 'First Class', color: 'text-green-500', bg: 'bg-green-50' },
          ].map((ach, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-2">
              <div className={`w-14 h-14 rounded-2xl ${ach.bg} flex items-center justify-center ${ach.color}`}>
                <ach.icon size={24} />
              </div>
              <p className="text-[10px] font-bold text-slate-600 leading-tight">{ach.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const CoursesScreen = ({ onPlay, onBack }: { onPlay: (video: any) => void, onBack: () => void }) => {
  const [search, setSearch] = useState('');
  
  const courses = [
    { title: 'Yoga for Beginners', sessions: 12, instructor: 'Sarah J.', img: 'yoga-1', color: 'bg-blue-500', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-yoga-on-a-mat-in-a-sunny-room-40342-large.mp4' },
    { title: 'Advanced Vinyasa', sessions: 8, instructor: 'Michael R.', img: 'yoga-2', color: 'bg-purple-500', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-practicing-yoga-in-the-mountains-40341-large.mp4' },
    { title: 'Mindful Meditation', sessions: 15, instructor: 'Elena K.', img: 'yoga-3', color: 'bg-emerald-500', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-yoga-in-the-park-40340-large.mp4' },
    { title: 'Power Strength', sessions: 10, instructor: 'David W.', img: 'yoga-4', color: 'bg-orange-500', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-yoga-on-the-beach-40339-large.mp4' },
    { title: 'Morning Flow', duration: '20 min', level: 'Beginner', img: 'nature' },
    { title: 'Power Vinyasa', duration: '45 min', level: 'Intermediate', img: 'vibrant' },
  ];

  const filtered = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-slate-900">All Courses</h2>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search courses, instructors..." 
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((course, i) => (
          <div key={i} className="flex gap-4 p-4 rounded-3xl bg-white border border-slate-100 items-center cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => onPlay(course)}>
            <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
              <img src={`https://picsum.photos/seed/${course.img}/200/200`} alt={course.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900">{course.title}</h4>
              <p className="text-slate-400 text-xs">{(course as any).sessions ? (course as any).sessions + ' Sessions' : (course as any).duration} • {(course as any).instructor || (course as any).level}</p>
            </div>
            <button className="w-10 h-10 rounded-full bg-brand-pink flex items-center justify-center text-brand-accent">
              <Play size={16} fill="currentColor" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const FriendsScreen = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Friends & Challenges</h2>
      </header>

      <section>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Active Challenges</h3>
        <div className="space-y-4">
          {[
            { title: '7-Day Yoga Streak', participants: 4, progress: 80, color: 'bg-brand-accent' },
            { title: '1000 Kcal Burn', participants: 2, progress: 45, color: 'bg-purple-500' },
          ].map((ch, i) => (
            <Card key={i} className="space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-slate-900">{ch.title}</h4>
                <span className="text-xs font-bold text-brand-accent">{ch.progress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${ch.color} transition-all duration-1000`} style={{ width: `${ch.progress}%` }}></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex -space-x-2">
                  {[1,2,3,4].slice(0, ch.participants).map(p => (
                    <div key={p} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p + 10}`} alt="friend" />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400">{ch.participants} friends participating</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Friends List</h3>
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-white border border-slate-50">
              <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 20}`} alt="friend" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900">Friend {i}</h4>
                <p className="text-xs text-slate-400">Level {Math.floor(Math.random() * 5) + 1}</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const AIScreen = ({ onBack }: { onBack: () => void }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Hello! I'm your AI Yoga Assistant. How can I help you with your practice today? You can ask me for routine recommendations, pose tips, or wellness advice." }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...messages, { role: 'user', content: userMessage }].map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: "You are a professional yoga and wellness assistant for the YogLira app. Provide helpful, encouraging, and safe yoga advice. Keep responses concise and formatted with markdown.",
        }
      });

      const aiText = response.text || "I'm sorry, I couldn't process that. Please try again.";
      setMessages(prev => [...prev, { role: 'assistant', content: aiText }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please check your connection and try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden pb-24">
      <header className="p-6 bg-white border-b border-slate-100 flex items-center gap-4">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900">AI Assistant</h2>
          <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Online
          </p>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
        {messages.map((m, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed",
              m.role === 'user' 
                ? "bg-brand-accent text-white ml-auto rounded-tr-none" 
                : "bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm"
            )}
          >
            <div className="markdown-body">
              <Markdown>{m.content}</Markdown>
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm max-w-[100px] flex gap-1 justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:0.4s]"></div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative flex items-center">
          <input 
            type="text" 
            placeholder="Ask anything about yoga..." 
            className="w-full pl-4 pr-14 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 w-10 h-10 rounded-xl bg-brand-accent text-white flex items-center justify-center disabled:opacity-50 active:scale-95 transition-all"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingsScreen = ({ user, onBack, onUpdateUser, initialView = 'main' }: { user: UserData, onBack: () => void, onUpdateUser: (user: UserData) => void, initialView?: 'main' | 'personal' | 'security' | 'privacy' | 'notifications' | 'ai' }) => {
  const [view, setView] = useState<'main' | 'personal' | 'security' | 'privacy' | 'notifications' | 'ai'>(initialView);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    age: user.age || '',
    mobile: user.mobile || '',
    country: user.country || '',
    address: user.address || ''
  });
  const [passwords, setPasswords] = useState({ current: '', new: '' });
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        onUpdateUser(data.user);
        alert('Profile updated successfully!');
        setView('main');
      } else {
        alert(data.error || 'Failed to update profile');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwords.current || !passwords.new) return alert('Please fill all fields');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new })
      });
      const data = await res.json();
      if (data.success) {
        alert('Password updated successfully!');
        setPasswords({ current: '', new: '' });
        setView('main');
      } else {
        alert(data.error || 'Failed to update password');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    const newState = !user.twoFactorEnabled;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/toggle-2fa', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ enabled: newState })
      });
      const data = await res.json();
      if (data.success) {
        onUpdateUser({ ...user, twoFactorEnabled: newState });
        alert(`Two-Factor Authentication ${newState ? 'enabled' : 'disabled'}`);
      } else {
        alert(data.error || 'Failed to toggle 2FA');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePreference = async (key: string, value: boolean) => {
    const newPrefs = { ...user.preferences, [key]: value };
    try {
      const res = await fetch('/api/auth/update-preferences', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ preferences: newPrefs })
      });
      const data = await res.json();
      if (data.success) {
        onUpdateUser({ ...user, preferences: newPrefs as any });
      }
    } catch (err) {
      console.error("Failed to update preferences", err);
    }
  };

  if (view === 'personal') {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
        <header className="flex items-center gap-4">
          <button onClick={() => setView('main')} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-slate-900">Personal Info</h2>
        </header>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Full Name</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-brand-accent/20 outline-none" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Age</label>
              <input 
                type="number" 
                value={formData.age} 
                onChange={e => setFormData({...formData, age: e.target.value})}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-brand-accent/20 outline-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Mobile Number</label>
              <input 
                type="tel" 
                value={formData.mobile} 
                onChange={e => setFormData({...formData, mobile: e.target.value})}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-brand-accent/20 outline-none" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Email Address</label>
            <input 
              type="email" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-brand-accent/20 outline-none" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Country</label>
            <input 
              type="text" 
              value={formData.country} 
              onChange={e => setFormData({...formData, country: e.target.value})}
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-brand-accent/20 outline-none" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Address</label>
            <textarea 
              value={formData.address} 
              onChange={e => setFormData({...formData, address: e.target.value})}
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-brand-accent/20 outline-none min-h-[100px]" 
            />
          </div>
          <Button className="w-full" onClick={handleUpdateProfile} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    );
  }

  if (view === 'security') {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
        <header className="flex items-center gap-4">
          <button onClick={() => setView('main')} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-slate-900">Security</h2>
        </header>
        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900">Two-Factor Auth</p>
                <p className="text-xs text-slate-400">Add an extra layer of security</p>
              </div>
              <div 
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${user.twoFactorEnabled ? 'bg-brand-accent' : 'bg-slate-200'}`} 
                onClick={handleToggle2FA}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${user.twoFactorEnabled ? 'left-7' : 'left-1'}`}></div>
              </div>
            </div>
          </Card>
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase">Change Password</h3>
            <input 
              type="password" 
              placeholder="Current Password" 
              value={passwords.current}
              onChange={e => setPasswords({...passwords, current: e.target.value})}
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none" 
            />
            <input 
              type="password" 
              placeholder="New Password" 
              value={passwords.new}
              onChange={e => setPasswords({...passwords, new: e.target.value})}
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none" 
            />
            <Button className="w-full" variant="secondary" onClick={handleUpdatePassword} disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'notifications') {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
        <header className="flex items-center gap-4">
          <button onClick={() => setView('main')} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-slate-900">Notifications</h2>
        </header>
        <div className="space-y-4">
          {[
            { label: 'Daily Reminders', desc: 'Get notified for your daily yoga sessions', id: 'dailyReminders' },
            { label: 'Challenge Updates', desc: 'Stay updated on friend challenges', id: 'challengeUpdates' },
            { label: 'New Courses', desc: 'Announcements for new yoga flows', id: 'newCourses' },
            { label: 'Promotions', desc: 'Special offers and referral rewards', id: 'promotions' },
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center p-4 bg-white border border-slate-50 rounded-2xl">
              <div className="flex-1 pr-4">
                <p className="font-bold text-slate-900 text-sm">{item.label}</p>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
              <div 
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${(user.preferences as any)?.[item.id] ? 'bg-brand-accent' : 'bg-slate-200'}`} 
                onClick={() => handleUpdatePreference(item.id, !(user.preferences as any)?.[item.id])}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${(user.preferences as any)?.[item.id] ? 'left-7' : 'left-1'}`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'privacy') {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
        <header className="flex items-center gap-4">
          <button onClick={() => setView('main')} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-slate-900">Privacy</h2>
        </header>
        <div className="space-y-4">
          {[
            { label: 'Public Profile', desc: 'Allow others to see your yoga progress', id: 'publicProfile' },
            { label: 'Share Activity', desc: 'Automatically share completed sessions with friends', id: 'shareActivity' },
            { label: 'Data Analytics', desc: 'Help us improve by sharing anonymous usage data', id: 'dataAnalytics' },
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center p-4 bg-white border border-slate-50 rounded-2xl">
              <div className="flex-1 pr-4">
                <p className="font-bold text-slate-900 text-sm">{item.label}</p>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
              <div 
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${(user.preferences as any)?.[item.id] ? 'bg-brand-accent' : 'bg-slate-200'}`} 
                onClick={() => handleUpdatePreference(item.id, !(user.preferences as any)?.[item.id])}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${(user.preferences as any)?.[item.id] ? 'left-7' : 'left-1'}`}></div>
              </div>
            </div>
          ))}
          <Button variant="secondary" className="w-full mt-4" onClick={() => alert('Data export requested. You will receive an email shortly.')}>Export My Data</Button>
        </div>
      </div>
    );
  }

  if (view === 'ai') {
    const aiPersonality = (user.preferences as any)?.aiPersonality || 'Encouraging & Warm';
    const aiFocusAreas = (user.preferences as any)?.aiFocusAreas || [];

    const handleToggleFocus = (tag: string) => {
      const newAreas = aiFocusAreas.includes(tag) 
        ? aiFocusAreas.filter((t: string) => t !== tag)
        : [...aiFocusAreas, tag];
      handleUpdatePreference('aiFocusAreas', newAreas as any);
    };

    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
        <header className="flex items-center gap-4">
          <button onClick={() => setView('main')} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-slate-900">AI Customization</h2>
        </header>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Assistant Personality</label>
            <select 
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-sm"
              value={aiPersonality}
              onChange={e => handleUpdatePreference('aiPersonality', e.target.value as any)}
            >
              <option>Encouraging & Warm</option>
              <option>Strict & Disciplined</option>
              <option>Zen & Minimalist</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Focus Areas</label>
            <div className="flex flex-wrap gap-2">
              {['Flexibility', 'Strength', 'Stress Relief', 'Better Sleep', 'Weight Loss'].map(tag => (
                <button 
                  key={tag} 
                  onClick={() => handleToggleFocus(tag)}
                  className={cn(
                    "px-4 py-2 rounded-full border text-xs font-medium transition-colors",
                    aiFocusAreas.includes(tag) 
                      ? "bg-brand-accent border-brand-accent text-white" 
                      : "border-slate-200 text-slate-600 hover:bg-brand-pink hover:border-brand-accent"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <Button className="w-full" onClick={() => { alert('AI preferences saved!'); setView('main'); }}>Done</Button>
        </div>
      </div>
    );
  }

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Personal Information', desc: 'Name, email, and phone number', id: 'personal' },
        { icon: Lock, label: 'Password & Security', desc: 'Change password, 2FA', id: 'security' },
        { icon: Shield, label: 'Privacy', desc: 'Manage your data and visibility', id: 'privacy' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell, label: 'Notifications', desc: 'Reminders, updates, and news', id: 'notifications' },
        { icon: Sparkles, label: 'AI Customization', desc: 'Tailor your AI assistant', id: 'ai' },
      ]
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
      </header>

      {sections.map((section, i) => (
        <div key={i} className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">{section.title}</h3>
          <div className="space-y-2">
            {section.items.map((item, j) => (
              <button 
                key={j}
                onClick={() => {
                  if (['personal', 'security', 'notifications', 'privacy', 'ai'].includes(item.id)) {
                    setView(item.id as any);
                  } else {
                    alert(`${item.label} feature coming soon!`);
                  }
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-50 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <item.icon size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 text-sm">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const SupportScreen = ({ onBack }: { onBack: () => void }) => {
  const [view, setView] = useState<'main' | 'faqs' | 'contact' | 'terms'>('main');

  if (view === 'faqs') {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
        <header className="flex items-center gap-4">
          <button onClick={() => setView('main')} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-slate-900">FAQs</h2>
        </header>
        <div className="space-y-4">
          {[
            { q: 'How do I cancel my subscription?', a: 'You can cancel anytime from the Billing tab in the bottom navigation.' },
            { q: 'Can I use the app offline?', a: 'Currently, an internet connection is required to stream videos and use the AI assistant.' },
            { q: 'How do referral rewards work?', a: 'Share your code from the Wallet screen. You earn $3 for every friend who starts a trial.' },
            { q: 'Is the AI assistant safe?', a: 'Yes, our AI is trained on professional yoga guidance, but always listen to your body.' },
          ].map((faq, i) => (
            <Card key={i} className="space-y-2">
              <p className="font-bold text-slate-900 text-sm">{faq.q}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{faq.a}</p>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'contact') {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
        <header className="flex items-center gap-4">
          <button onClick={() => setView('main')} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-slate-900">Contact Us</h2>
        </header>
        <div className="space-y-6">
          <Card className="text-center py-8">
            <div className="w-16 h-16 bg-brand-pink rounded-full flex items-center justify-center mx-auto mb-4 text-brand-accent">
              <Send size={32} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Send us a message</h3>
            <p className="text-xs text-slate-500 mb-6">Our team typically responds within 24 hours.</p>
            <textarea placeholder="How can we help you today?" className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 h-32 outline-none text-sm mb-4"></textarea>
            <Button className="w-full" onClick={() => { alert('Message sent!'); setView('main'); }}>Send Message</Button>
          </Card>
        </div>
      </div>
    );
  }

  if (view === 'terms') {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
        <header className="flex items-center gap-4">
          <button onClick={() => setView('main')} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-slate-900">Terms of Service</h2>
        </header>
        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <section className="space-y-2">
            <h3 className="font-bold text-slate-900">1. Acceptance of Terms</h3>
            <p>By using YogLira, you agree to these terms. If you do not agree, please do not use the service.</p>
          </section>
          <section className="space-y-2">
            <h3 className="font-bold text-slate-900">2. Health Disclaimer</h3>
            <p>Yoga involves physical activity. Consult a physician before starting any new exercise program. YogLira is not responsible for any injuries sustained during practice.</p>
          </section>
          <section className="space-y-2">
            <h3 className="font-bold text-slate-900">3. Subscription & Billing</h3>
            <p>Subscriptions are billed monthly. You can cancel at any time. Refunds are subject to our refund policy.</p>
          </section>
          <section className="space-y-2">
            <h3 className="font-bold text-slate-900">4. Privacy</h3>
            <p>Your privacy is important to us. Please review our Privacy Policy to understand how we collect and use your data.</p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Help & Support</h2>
      </header>

      <Card className="bg-brand-accent text-white border-none">
        <h3 className="text-lg font-bold mb-2">How can we help?</h3>
        <p className="text-white/80 text-sm mb-6">Search our help center or contact our support team directly.</p>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input 
            type="text" 
            placeholder="Search help articles..." 
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:bg-white/20 transition-all text-sm placeholder:text-white/40"
          />
        </div>
      </Card>

      <div className="space-y-3">
        {[
          { icon: HelpCircle, label: 'FAQs', desc: 'Find quick answers to common questions', id: 'faqs' },
          { icon: Send, label: 'Contact Support', desc: 'Chat with our team', id: 'contact' },
          { icon: Shield, label: 'Terms of Service', desc: 'Read our legal terms', id: 'terms' },
        ].map((item, i) => (
          <button 
            key={i}
            onClick={() => {
              if (['faqs', 'contact', 'terms'].includes(item.id)) {
                setView(item.id as any);
              } else {
                alert(`${item.label} feature coming soon!`);
              }
            }}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-50 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
              <item.icon size={20} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-900 text-sm">{item.label}</p>
              <p className="text-xs text-slate-400">{item.desc}</p>
            </div>
            <ChevronRight size={18} className="text-slate-300" />
          </button>
        ))}
      </div>
    </div>
  );
};

const NotificationsScreen = ({ onBack, notifications, onMarkRead, onMarkAllRead, onGoToSettings }: { onBack: () => void, notifications: any[], onMarkRead: (id: number) => void, onMarkAllRead: () => void, onGoToSettings: () => void }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-slate-900">Notifications</h2>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onGoToSettings}
            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:text-brand-accent transition-colors"
          >
            <Settings size={20} />
          </button>
          <button 
            onClick={onMarkAllRead}
            className="text-brand-accent text-xs font-bold uppercase tracking-widest hover:underline"
          >
            Mark all
          </button>
        </div>
      </header>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Bell size={32} />
            </div>
            <p className="text-slate-400 font-medium">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notif, i) => (
            <Card 
              key={i} 
              onClick={() => !notif.is_read && onMarkRead(notif.id)}
              className={cn(
                "relative overflow-hidden transition-all cursor-pointer active:scale-[0.98]", 
                !notif.is_read ? "border-brand-accent/20 bg-brand-pink/20" : "opacity-70"
              )}
            >
              {!notif.is_read && <div className="absolute top-0 left-0 w-1 h-full bg-brand-accent"></div>}
              <div className="flex gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  notif.type === 'success' ? "bg-emerald-50 text-emerald-500" : 
                  notif.type === 'warning' ? "bg-amber-50 text-amber-500" : 
                  "bg-blue-50 text-blue-500"
                )}>
                  {notif.type === 'success' ? <CheckCircle size={20} /> : <Bell size={20} />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-900 text-sm">{notif.title}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">{new Date(notif.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{notif.message}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

const YogaPracticeScreen = ({ poseName, onBack }: { poseName: string, onBack: () => void }) => {
  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden pb-24">
      <header className="p-6 bg-white border-b border-slate-100 flex items-center gap-4">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900">AI Practice</h2>
          <p className="text-[10px] text-brand-accent font-bold uppercase tracking-widest flex items-center gap-1">
            <Scan size={10} />
            Real-time Analysis
          </p>
        </div>
      </header>

      <div className="flex-1 p-6 overflow-y-auto space-y-6 no-scrollbar">
        <PoseDetectionOverlay targetPoseName={poseName} />
        
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">How to perform</h3>
          <Card className="bg-white border-slate-100">
            <p className="text-sm text-slate-600 leading-relaxed">
              Ensure you are in a well-lit area and your full body is visible in the camera frame. 
              The AI will provide real-time feedback on your alignment and form.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

const RoutineGeneratorScreen = ({ onBack, onPractice }: { onBack: () => void, onPractice: (pose: string) => void }) => {
  const [loading, setLoading] = useState(false);
  const [routine, setRoutine] = useState<any>(null);
  const [level, setLevel] = useState('Beginner');
  const [goals, setGoals] = useState('Flexibility, Stress Relief');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate-routine', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ level, goals })
      });
      const data = await res.json();
      setRoutine(data);
    } catch (error) {
      alert("Failed to generate routine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-slate-900">AI Routine Generator</h2>
      </header>

      {!routine ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Your Level</label>
            <select 
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none"
              value={level}
              onChange={e => setLevel(e.target.value)}
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Focus Goals</label>
            <input 
              type="text" 
              placeholder="e.g. Flexibility, Strength, Stress Relief" 
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none"
              value={goals}
              onChange={e => setGoals(e.target.value)}
            />
          </div>
          <Button className="w-full flex items-center justify-center gap-2" onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Sparkles size={20} />
                Generate Routine
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="bg-brand-pink border-brand-accent/10">
            <h3 className="text-xl font-bold text-slate-900 mb-2">{routine.title}</h3>
            <p className="text-sm text-slate-600">{routine.description}</p>
          </Card>
          
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Poses</h4>
            {routine.poses.map((pose: any, i: number) => (
              <div key={i} className="flex gap-4 p-4 bg-white border border-slate-50 rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent font-bold">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-slate-900">{pose.name}</p>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onPractice(pose.name)}
                        className="p-1.5 rounded-lg bg-brand-accent/10 text-brand-accent hover:bg-brand-accent hover:text-white transition-colors"
                        title="Practice with AI"
                      >
                        <Camera size={14} />
                      </button>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{pose.duration}s</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{pose.instructions}</p>
                </div>
              </div>
            ))}
          </div>
          
          <Button className="w-full" variant="secondary" onClick={() => setRoutine(null)}>Generate Another</Button>
        </div>
      )}
    </div>
  );
};

const WalletScreen = ({ user }: { user: UserData }) => {
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [sharing, setSharing] = useState(false);

  const fetchWalletData = async () => {
    try {
      const res = await fetch('/api/wallet', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setWallet(data.wallet);
      setTransactions(data.transactions);
    } catch (error) {
      console.error("Failed to fetch wallet data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleWithdraw = async () => {
    if (!wallet || wallet.balance < 50) return;
    
    setWithdrawing(true);
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ amount: wallet.balance })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Withdrawal of $${wallet.balance.toFixed(2)} requested successfully! Processing via ICICI Bank.`);
        fetchWalletData();
      } else {
        alert(data.error || "Withdrawal failed");
      }
    } catch (error) {
      alert("Network error during withdrawal");
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
      <h2 className="text-2xl font-bold text-slate-900">My Wallet</h2>
      
      <Card className="bg-slate-900 text-white border-none relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-slate-400 text-sm mb-2">Total Balance</p>
          <h3 className="text-4xl font-bold mb-8">${wallet?.balance?.toFixed(2) || '0.00'}</h3>
          <div className="flex gap-4">
            <Button 
              className="flex-1 py-2 text-sm" 
              disabled={!wallet || wallet.balance < 50 || withdrawing}
              onClick={handleWithdraw}
            >
              {withdrawing ? 'Processing...' : 'Withdraw'}
            </Button>
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Min. Withdrawal</p>
              <p className="text-sm font-bold">$50.00</p>
            </div>
          </div>
        </div>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-accent/20 rounded-full blur-3xl"></div>
      </Card>

      <section>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Referral Program</h3>
        <Card className="bg-brand-pink border-brand-accent/10">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-600 text-sm mb-1">Your Referral Code</p>
              <p className="text-xl font-mono font-bold text-brand-accent">{user.referralCode}</p>
            </div>
            <button 
              disabled={sharing}
              onClick={async () => {
                if (navigator.share) {
                  if (sharing) return;
                  setSharing(true);
                  try {
                    await navigator.share({
                      title: 'Join me on YogLira!',
                      text: `Use my referral code ${user.referralCode} to get a $3 bonus when you join YogLira!`,
                      url: window.location.origin
                    });
                  } catch (err: any) {
                    // Ignore AbortError (user cancelled)
                    if (err.name !== 'AbortError') {
                      console.error("Share failed", err);
                    }
                  } finally {
                    setSharing(false);
                  }
                } else {
                  navigator.clipboard.writeText(user.referralCode);
                  alert('Referral code copied to clipboard!');
                }
              }}
              className="p-3 bg-white rounded-2xl text-brand-accent shadow-sm active:scale-95 transition-transform disabled:opacity-50"
            >
              <Share2 size={20} />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-4">Earn $3.00 for every friend who joins and starts their trial!</p>
        </Card>
      </section>

      <section>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Transaction History</h3>
        <div className="space-y-3">
          {transactions.map((tx, i) => (
            <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-white border border-slate-50">
              <div>
                <p className="font-semibold text-slate-900">{tx.description}</p>
                <p className="text-xs text-slate-400">{new Date(tx.created_at).toLocaleDateString()}</p>
              </div>
              <p className={cn(
                "font-bold",
                tx.type === 'credit' ? 'text-emerald-500' : 'text-red-500'
              )}>
                {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
              </p>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="text-center text-slate-400 py-8">No transactions yet</p>
          )}
        </div>
      </section>
    </div>
  );
};

const SubscriptionScreen = ({ user }: { user: UserData }) => {
  const [showSetup, setShowSetup] = useState(false);
  const [subData, setSubData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedPlan, setSelectedPlan] = useState<any>({ id: 'premium_monthly', name: 'Premium Monthly', price: '$9.99', period: 'mo' });

  useEffect(() => {
    if (user.subscriptionStatus !== 'inactive') {
      fetch('/api/subscription', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      .then(res => res.json())
      .then(data => {
        setSubData(data.subscription);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user.subscriptionStatus]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;
    
    try {
      const res = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        alert('Subscription canceled successfully');
        window.location.reload();
      }
    } catch (err) {
      alert('Failed to cancel subscription');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent"></div>
      </div>
    );
  }

  if (showSetup || user.subscriptionStatus === 'pending_payment') {
    return <PaymentSetupScreen user={user} plan={selectedPlan} onComplete={() => window.location.reload()} onBack={() => setShowSetup(false)} />;
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
      <h2 className="text-2xl font-bold text-slate-900">Subscription</h2>
      
      {user.subscriptionStatus === 'inactive' ? (
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-brand-pink to-white border-brand-accent/20">
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-brand-accent" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Unlock Premium Access</h3>
              <p className="text-slate-500 text-sm mb-6">Get personalized AI routines, full video library, and more.</p>
              <div className="text-3xl font-bold text-slate-900 mb-1">$9.99<span className="text-sm font-normal text-slate-400">/month</span></div>
              <p className="text-emerald-500 font-semibold text-sm">7 Days Free Trial</p>
            </div>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-600">
              <CheckCircle2 className="text-emerald-500" size={20} />
              <span className="text-sm">Personalized AI Yoga Routines</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <CheckCircle2 className="text-emerald-500" size={20} />
              <span className="text-sm">Unlimited Video Library</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <CheckCircle2 className="text-emerald-500" size={20} />
              <span className="text-sm">Advanced Progress Tracking</span>
            </div>
          </div>

          <Button 
            className="w-full" 
            onClick={() => setShowSetup(true)}
          >
            Start 7-Day Free Trial
          </Button>
          <p className="text-[10px] text-center text-slate-400">Mandatory autopay enabled after trial via ICICI Bank. Cancel anytime.</p>
        </div>
      ) : (
        <Card className={cn(
          "border-none",
          user.subscriptionStatus === 'active' ? "bg-emerald-50 border-emerald-100" : "bg-blue-50 border-blue-100"
        )}>
          <div className="flex items-center gap-4 mb-4">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center text-white",
              user.subscriptionStatus === 'active' ? "bg-emerald-500" : "bg-blue-500"
            )}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">
                {user.subscriptionStatus === 'active' ? 'Active Subscription' : 'Trial Period'}
              </h3>
              <p className={cn(
                "text-xs uppercase font-bold tracking-wider",
                user.subscriptionStatus === 'active' ? "text-emerald-600" : "text-blue-600"
              )}>
                {user.subscriptionStatus}
              </p>
            </div>
          </div>
          <div className={cn(
            "pt-4 border-t space-y-2",
            user.subscriptionStatus === 'active' ? "border-emerald-100" : "border-blue-100"
          )}>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">
                {user.subscriptionStatus === 'active' ? 'Next Billing Date' : 'Trial Ends On'}
              </span>
              <span className="font-semibold text-slate-900">
                {subData?.next_billing_date ? new Date(subData.next_billing_date).toLocaleDateString() : 
                 subData?.trial_end ? new Date(subData.trial_end).toLocaleDateString() : '...'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Amount</span>
              <span className="font-semibold text-slate-900">
                {subData?.amount ? `$${subData.amount.toFixed(2)}` : '$9.99'}
              </span>
            </div>
          </div>
          <button 
            onClick={handleCancel}
            className="w-full mt-6 text-slate-400 text-xs font-medium hover:text-red-500 transition-colors"
          >
            Cancel Subscription
          </button>
        </Card>
      )}
    </div>
  );
};

// --- Main App Component ---

// --- Main App ---

const SplashScreen = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mobile-container items-center justify-center bg-brand-pink overflow-hidden"
    >
      {/* Serene Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 20, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-brand-purple rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -30, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-white rounded-full blur-[120px]"
        />
      </div>

      {/* Central Content */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-32 h-32 bg-white rounded-[48px] shadow-2xl shadow-brand-accent/10 flex items-center justify-center relative z-10 border border-white"
          >
            <motion.div
              animate={{ 
                rotate: [0, 5, 0, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Flower2 className="text-brand-accent" size={56} strokeWidth={1.5} />
            </motion.div>
          </motion.div>

          {/* Breathing Rings */}
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 1, opacity: 0 }}
              animate={{ 
                scale: [1, 1.8],
                opacity: [0.3, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                delay: i * 1.2,
                ease: "easeOut" 
              }}
              className="absolute inset-0 border border-brand-accent/20 rounded-[48px] -z-0"
            />
          ))}
        </div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="text-center"
        >
          <h1 className="text-5xl font-serif italic text-slate-800 tracking-tight mb-2">YogLira</h1>
          <div className="flex items-center justify-center gap-2 text-brand-accent/60">
            <Wind size={12} />
            <p className="font-medium tracking-[0.3em] uppercase text-[9px]">Breathe & Evolve</p>
            <Wind size={12} className="rotate-180" />
          </div>
        </motion.div>
      </div>

      {/* Minimal Loading Indicator */}
      <div className="absolute bottom-20 w-full px-16 flex flex-col items-center gap-4">
        <div className="h-[2px] w-full bg-white/50 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            className="h-full bg-brand-accent"
          />
        </div>
        <motion.p 
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-[10px] text-slate-500 font-medium tracking-widest uppercase"
        >
          Preparing your space
        </motion.p>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  const [debug, setDebug] = useState<string[]>([]);
  const addLog = (msg: string) => setDebug(prev => [...prev.slice(-5), msg]);

  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [playingVideo, setPlayingVideo] = useState<any>(null);
  const [practicePose, setPracticePose] = useState<string | null>(null);
  const [settingsView, setSettingsView] = useState<'main' | 'personal' | 'security' | 'privacy' | 'notifications' | 'ai'>('main');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [reminder, setReminder] = useState<string | null>(localStorage.getItem('yoga_reminder'));
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const alarmAudio = React.useRef<HTMLAudioElement | null>(null);

  const [authMode, setAuthMode] = useState<'auth' | 'forgot' | 'reset'>('auth');
  const [resetToken, setResetToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for reset token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      setAuthMode('reset');
      setResetToken(token);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    // Initialize alarm sound
    alarmAudio.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
    alarmAudio.current.loop = true;
  }, []);

  useEffect(() => {
    if (!reminder) return;

    const checkReminder = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      if (currentTime === reminder && !isAlarmRinging) {
        setIsAlarmRinging(true);
        alarmAudio.current?.play().catch(e => console.error("Audio play failed", e));
        
        // Add a notification to the list
        const token = localStorage.getItem('token');
        if (token) {
          fetch('/api/notifications', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
              title: "Yoga Time! 🧘‍♀️",
              message: "Your scheduled yoga session is starting now. Time to roll out your mat!",
              type: "warning"
            })
          }).then(() => fetchNotifications());
        }
      } else if (currentTime !== reminder && isAlarmRinging) {
        // Stop ringing after a minute or if time passed
        // Actually we should probably let user stop it
      }
    };

    const interval = setInterval(checkReminder, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [reminder, isAlarmRinging]);

  const stopAlarm = () => {
    setIsAlarmRinging(false);
    alarmAudio.current?.pause();
    if (alarmAudio.current) alarmAudio.current.currentTime = 0;
  };

  const handleSetReminder = (time: string | null) => {
    setReminder(time);
    if (time) {
      localStorage.setItem('yoga_reminder', time);
    } else {
      localStorage.removeItem('yoga_reminder');
    }
  };

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleNavigate = (tab: string, subView?: any) => {
    setActiveTab(tab);
    if (tab === 'settings' && subView) {
      setSettingsView(subView);
    } else if (tab === 'settings') {
      setSettingsView('main');
    }
  };

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      
      try {
        const res = await fetch('/api/auth/update-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            ...user,
            profile_picture: base64String
          })
        });
        
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        } else {
          alert('Failed to update profile picture');
        }
      } catch (err) {
        console.error('Error uploading image:', err);
        alert('Network error. Please try again.');
      }
    };
    reader.readAsDataURL(file);
  };

  const initAuth = async () => {
    addLog("Checking token...");
    const startTime = Date.now();
    const token = localStorage.getItem('token');
    
    if (!token) {
      addLog("No token found");
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 2500 - elapsed);
      setTimeout(() => {
        setLoading(false);
        setShowSplash(false);
      }, remaining);
      return;
    }

    addLog("Token found, fetching user...");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      addLog(`Response status: ${res.status}`);
      
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          addLog("User loaded");
          setUser(data.user);
        } else {
          addLog("No user in response");
          localStorage.removeItem('token');
        }
      } else {
        addLog("Response not OK");
        localStorage.removeItem('token');
      }
    } catch (error: any) {
      addLog(`Error: ${error.message || 'Unknown'}`);
      localStorage.removeItem('token');
    } finally {
      addLog("Finishing init");
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 2500 - elapsed);
      setTimeout(() => {
        setLoading(false);
        setShowSplash(false);
      }, remaining);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  if (showSplash) return <SplashScreen />;

  if (!user) {
    return (
      <div className="mobile-container">
        {authMode === 'auth' && (
          <LoginScreen 
            onLogin={setUser} 
            onForgotPassword={() => setAuthMode('forgot')} 
          />
        )}
        {authMode === 'forgot' && (
          <ForgotPasswordScreen 
            onBack={() => setAuthMode('auth')} 
          />
        )}
        {authMode === 'reset' && (
          <ResetPasswordScreen 
            token={resetToken} 
            onComplete={() => setAuthMode('auth')} 
          />
        )}
      </div>
    );
  }

  if (playingVideo) {
    return <VideoPlayerScreen video={playingVideo} onBack={() => setPlayingVideo(null)} />;
  }

  if (user.role === 'admin' && activeTab === 'admin') {
    return <AdminPanel onLogout={() => { localStorage.removeItem('token'); setUser(null); }} />;
  }

  if (user.subscriptionStatus === 'pending_payment') {
    return (
      <div className="mobile-container overflow-y-auto">
        {!selectedPlan ? (
          <SubscriptionSelectionScreen onSelect={setSelectedPlan} />
        ) : (
          <PaymentSetupScreen 
            user={user} 
            plan={selectedPlan} 
            onBack={() => setSelectedPlan(null)}
            onComplete={initAuth} 
          />
        )}
      </div>
    );
  }

  return (
    <div className="mobile-container">
      {isAlarmRinging && (
        <div className="fixed inset-0 z-[200] bg-brand-accent flex flex-col items-center justify-center p-8 text-white text-center">
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center mb-8"
          >
            <AlarmClock size={64} />
          </motion.div>
          <h2 className="text-4xl font-bold mb-4 italic">Yoga Time!</h2>
          <p className="text-lg opacity-80 mb-12">Your scheduled session is starting now.</p>
          <div className="w-full space-y-4">
            <button 
              onClick={() => { stopAlarm(); handleNavigate('ai-routine'); }}
              className="w-full py-5 rounded-3xl bg-white text-brand-accent font-bold text-lg shadow-xl active:scale-95 transition-all"
            >
              Start Session
            </button>
            <button 
              onClick={stopAlarm}
              className="w-full py-5 rounded-3xl bg-white/10 text-white font-bold text-lg hover:bg-white/20 active:scale-95 transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="flex-1 flex flex-col overflow-hidden"
        >
          {activeTab === 'home' && <HomeScreen user={user} onPlay={setPlayingVideo} onNavigate={handleNavigate} unreadCount={notifications.filter(n => !n.is_read).length} reminder={reminder} onSetReminder={handleSetReminder} />}
          {activeTab === 'notifications' && (
            <NotificationsScreen 
              onBack={() => handleNavigate('home')} 
              notifications={notifications} 
              onMarkRead={async (id) => {
                const token = localStorage.getItem('token');
                await fetch('/api/notifications/mark-read', {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                  },
                  body: JSON.stringify({ id })
                });
                fetchNotifications();
              }}
              onMarkAllRead={async () => {
                const token = localStorage.getItem('token');
                await fetch('/api/notifications/mark-all-read', {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                fetchNotifications();
              }} 
              onGoToSettings={() => handleNavigate('settings', 'notifications')}
            />
          )}
          {activeTab === 'stats' && <StatsScreen onBack={() => handleNavigate('home')} />}
          {activeTab === 'courses' && <CoursesScreen onPlay={setPlayingVideo} onBack={() => handleNavigate('home')} />}
          {activeTab === 'friends' && <FriendsScreen onBack={() => handleNavigate('home')} />}
          {activeTab === 'ai' && <AIScreen onBack={() => handleNavigate('home')} />}
          {activeTab === 'ai-routine' && (
            <RoutineGeneratorScreen 
              onBack={() => handleNavigate('home')} 
              onPractice={(pose) => {
                setPracticePose(pose);
                handleNavigate('practice');
              }}
            />
          )}
          {activeTab === 'practice' && (
            <YogaPracticeScreen 
              poseName={practicePose || 'Tree Pose'} 
              onBack={() => handleNavigate('ai-routine')} 
            />
          )}
          {activeTab === 'settings' && user && <SettingsScreen user={user} onBack={() => handleNavigate('profile')} onUpdateUser={setUser} initialView={settingsView} />}
          {activeTab === 'support' && <SupportScreen onBack={() => handleNavigate('profile')} />}
          {activeTab === 'wallet' && <WalletScreen user={user} />}
          {activeTab === 'billing' && <SubscriptionScreen user={user} />}
          {activeTab === 'profile' && (
            <div className="flex-1 p-6 space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Profile</h2>
              <Card className="flex items-center gap-4 relative">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden relative group cursor-pointer">
                  <img src={user.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="avatar" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={20} className="text-white" />
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={handleProfilePicUpload} 
                  />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{user.name}</h3>
                  <p className="text-slate-400 text-sm">{user.email}</p>
                </div>
              </Card>
              <div className="space-y-2">
                <button 
                  onClick={() => handleNavigate('settings')}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Settings size={20} className="text-slate-400" />
                    <span className="font-medium text-slate-700">Account Settings</span>
                  </div>
                  <ChevronRight size={20} className="text-slate-300" />
                </button>
                <button 
                  onClick={() => handleNavigate('support')}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle size={20} className="text-slate-400" />
                    <span className="font-medium text-slate-700">Help & Support</span>
                  </div>
                  <ChevronRight size={20} className="text-slate-300" />
                </button>
                <button 
                  onClick={() => { localStorage.removeItem('token'); setUser(null); }}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-50 text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Nav */}
      <nav className="absolute bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex justify-around items-center px-4 z-50">
        <NavItem icon={Home} label="Home" active={activeTab === 'home' || activeTab === 'stats' || activeTab === 'courses' || activeTab === 'friends'} onClick={() => handleNavigate('home')} />
        <NavItem icon={Wallet} label="Wallet" active={activeTab === 'wallet'} onClick={() => handleNavigate('wallet')} />
        <div className="relative -top-6">
          <button 
            onClick={() => handleNavigate('ai')}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-brand-accent/40 transition-all active:scale-90",
              (activeTab === 'ai' || activeTab === 'ai-routine') ? "bg-brand-accent text-white" : "bg-white text-brand-accent border border-brand-accent/10"
            )}
          >
            <MessageCircle size={28} />
          </button>
        </div>
        <NavItem icon={CreditCard} label="Billing" active={activeTab === 'billing'} onClick={() => handleNavigate('billing')} />
        <NavItem icon={User} label="Profile" active={activeTab === 'profile' || activeTab === 'settings' || activeTab === 'support'} onClick={() => handleNavigate('profile')} />
        {user.role === 'admin' && (
          <NavItem icon={Settings} label="Admin" active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} />
        )}
      </nav>
    </div>
  );
}
