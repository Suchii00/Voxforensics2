import { useState } from 'react';

interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  referralCode: string;
  referredBy?: string;
  createdAt: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  showTwoFactor: boolean;
}

export default function AuthSystem({ onLogin, onLogout }: { 
  onLogin: (user: User) => void;
  onLogout: () => void;
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  // Generate referral code
  const generateReferralCode = () => {
    return 'VF-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Generate 2FA secret (simplified - in production use proper TOTP)
  const generateTwoFactorSecret = () => {
    return Math.random().toString(36).substring(2, 15).toUpperCase();
  };

  // Register new user
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !name) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const users: User[] = JSON.parse(localStorage.getItem('voxforensics_users') || '[]');
    
    if (users.find(u => u.email === email)) {
      setError('Email already registered');
      return;
    }

    // Check referral code if provided
    if (referralCode) {
      const referrer = users.find(u => u.referralCode === referralCode);
      if (!referrer) {
        setError('Invalid referral code');
        return;
      }
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      password, // In production, hash this!
      name,
      role: email === 'admin@voxforensics.com' ? 'admin' : 'user',
      referralCode: generateReferralCode(),
      referredBy: referralCode || undefined,
      createdAt: new Date().toISOString(),
      twoFactorEnabled: false,
    };

    users.push(newUser);
    localStorage.setItem('voxforensics_users', JSON.stringify(users));

    // Award referral bonus if applicable
    if (referralCode) {
      const referrer = users.find(u => u.referralCode === referralCode);
      if (referrer) {
        const referrals = JSON.parse(localStorage.getItem(`referrals_${referrer.id}`) || '[]');
        referrals.push({ userId: newUser.id, date: new Date().toISOString() });
        localStorage.setItem(`referrals_${referrer.id}`, JSON.stringify(referrals));
      }
    }

    setShowTwoFactorSetup(true);
  };

  // Setup 2FA
  const handleSetupTwoFactor = () => {
    const users: User[] = JSON.parse(localStorage.getItem('voxforensics_users') || '[]');
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex !== -1) {
      users[userIndex].twoFactorEnabled = true;
      users[userIndex].twoFactorSecret = generateTwoFactorSecret();
      localStorage.setItem('voxforensics_users', JSON.stringify(users));
    }
    
    setShowTwoFactorSetup(false);
    setMode('login');
  };

  // Login user
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users: User[] = JSON.parse(localStorage.getItem('voxforensics_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      setError('Invalid email or password');
      return;
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // In production, verify TOTP code
      // For demo, we'll accept any 6-digit code
      if (!twoFactorCode || twoFactorCode.length !== 6) {
        setError('Please enter your 2FA code');
        return;
      }
    }

    localStorage.setItem('voxforensics_current_user', JSON.stringify(user));
    onLogin(user);
  };

  // Demo accounts info
  const demoAccounts = [
    { email: 'admin@voxforensics.com', password: 'admin123', role: 'Admin' },
    { email: 'user@example.com', password: 'user123', role: 'User' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(3, 7, 18, 0.95)', backdropFilter: 'blur(12px)' }}>
      <div className="glass-card p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="hero-title text-3xl mb-2">VoxForensics</h1>
          <p className="text-sm text-gray-400">
            {mode === 'login' ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        {/* 2FA Setup */}
        {showTwoFactorSetup && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <h3 className="text-sm font-semibold text-cyan-300 mb-2">🔐 Enable Two-Factor Authentication</h3>
              <p className="text-xs text-gray-300 mb-3">
                For enhanced security, we recommend enabling 2FA. Your secret key:
              </p>
              <div className="p-3 rounded-lg bg-black/40 font-mono text-xs text-cyan-400 break-all">
                {generateTwoFactorSecret()}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Save this key in your authenticator app (Google Authenticator, Authy, etc.)
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSetupTwoFactor} className="neon-btn flex-1">
                ✅ Enable 2FA
              </button>
              <button onClick={() => setShowTwoFactorSetup(false)} className="neon-btn neon-btn-danger flex-1">
                Skip
              </button>
            </div>
          </div>
        )}

        {/* Login/Register Form */}
        {!showTwoFactorSetup && (
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Referral Code (Optional)</label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none transition-colors"
                  placeholder="VF-XXXXXX"
                />
              </div>
            )}

            {mode === 'login' && (
              <div>
                <label className="text-xs text-gray-400 mb-1 block">2FA Code (if enabled)</label>
                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none transition-colors"
                  placeholder="6-digit code"
                  maxLength={6}
                />
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400">
                ❌ {error}
              </div>
            )}

            <button type="submit" className="neon-btn w-full py-3 text-base font-semibold">
              {mode === 'login' ? '🔓 Login' : '✨ Register'}
            </button>

            <div className="text-center text-sm text-gray-400">
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button type="button" onClick={() => { setMode('register'); setError(''); }} className="text-cyan-400 hover:text-cyan-300">
                    Register
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button type="button" onClick={() => { setMode('login'); setError(''); }} className="text-cyan-400 hover:text-cyan-300">
                    Login
                  </button>
                </>
              )}
            </div>
          </form>
        )}

        {/* Demo Accounts */}
        <div className="mt-6 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
          <p className="text-xs font-semibold text-purple-300 mb-2">🎮 Demo Accounts</p>
          <div className="space-y-1 text-xs text-gray-400">
            {demoAccounts.map((account, i) => (
              <div key={i} className="flex justify-between">
                <span>{account.role}:</span>
                <span className="font-mono text-purple-300">{account.email}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function getCurrentUser(): User | null {
  try {
    const user = localStorage.getItem('voxforensics_current_user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem('voxforensics_current_user');
}

export type { User };
