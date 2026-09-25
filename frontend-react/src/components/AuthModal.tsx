import React, { useState } from 'react';
import { User, Role } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

const DEMO_USERS = {
  CUSTOMER: { email: 'abhinay@klh.edu.in', password: 'Customer@123', name: 'Abhinay Sai', role: 'CUSTOMER' as Role },
  WAREHOUSE_MANAGER: { email: 'manager@commerce.kluniversity.in', password: 'Manager@123', name: 'Poli Naidu', role: 'WAREHOUSE_MANAGER' as Role },
  ADMIN: { email: 'admin@commerce.kluniversity.in', password: 'Admin@123', name: 'Admin Srinath', role: 'ADMIN' as Role }
};

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('CUSTOMER');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const url = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister
      ? { name, email, password, role }
      : { email, password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const isJson = res.headers.get('content-type')?.includes('application/json');

      if (res.ok && isJson) {
        const data = await res.json();
        sessionStorage.setItem('nex_token', data.token || data.access_token || '');
        sessionStorage.setItem('nex_user', JSON.stringify(data));
        onLoginSuccess(data);
        onClose();
        return;
      }

      if (!res.ok && isJson) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Authentication failed.');
      }

      // If response is not JSON or 404 (e.g. running on static GitHub Pages), authenticate locally
      const matchedDemo = Object.values(DEMO_USERS).find(u => u.email.toLowerCase() === email.toLowerCase());
      const fallbackUser: User = {
        user_id: matchedDemo ? (matchedDemo.role === 'ADMIN' ? 'usr_100' : matchedDemo.role === 'WAREHOUSE_MANAGER' ? 'usr_102' : 'usr_101') : 'usr_999',
        email: email || 'user@klh.edu.in',
        name: name || (matchedDemo ? matchedDemo.name : email.split('@')[0] || 'User'),
        role: matchedDemo ? matchedDemo.role : (role || 'CUSTOMER'),
        token: `sim_token_${Date.now()}`,
        access_token: `sim_token_${Date.now()}`
      };

      sessionStorage.setItem('nex_token', fallbackUser.token!);
      sessionStorage.setItem('nex_user', JSON.stringify(fallbackUser));
      onLoginSuccess(fallbackUser);
      onClose();
    } catch (err: any) {
      if (err.message && !err.message.includes('JSON') && !err.message.includes('fetch')) {
        setErrorMsg(err.message || 'Login error');
      } else {
        // Fallback for static GitHub Pages or offline execution
        const matchedDemo = Object.values(DEMO_USERS).find(u => u.email.toLowerCase() === email.toLowerCase());
        const fallbackUser: User = {
          user_id: matchedDemo ? (matchedDemo.role === 'ADMIN' ? 'usr_100' : matchedDemo.role === 'WAREHOUSE_MANAGER' ? 'usr_102' : 'usr_101') : 'usr_999',
          email: email || 'user@klh.edu.in',
          name: name || (matchedDemo ? matchedDemo.name : email.split('@')[0] || 'User'),
          role: matchedDemo ? matchedDemo.role : (role || 'CUSTOMER'),
          token: `sim_token_${Date.now()}`,
          access_token: `sim_token_${Date.now()}`
        };

        sessionStorage.setItem('nex_token', fallbackUser.token!);
        sessionStorage.setItem('nex_user', JSON.stringify(fallbackUser));
        onLoginSuccess(fallbackUser);
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoKey: keyof typeof DEMO_USERS) => {
    const creds = DEMO_USERS[demoKey];
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: creds.email, password: creds.password })
      });

      const isJson = res.headers.get('content-type')?.includes('application/json');

      if (res.ok && isJson) {
        const data = await res.json();
        sessionStorage.setItem('nex_token', data.token || data.access_token || '');
        sessionStorage.setItem('nex_user', JSON.stringify(data));
        onLoginSuccess(data);
        onClose();
        return;
      }

      if (!res.ok && isJson) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Demo login failed');
      }

      // Offline GitHub Pages fallback for 1-Click Demo Login
      const demoUser: User = {
        user_id: demoKey === 'CUSTOMER' ? 'usr_101' : demoKey === 'WAREHOUSE_MANAGER' ? 'usr_102' : 'usr_100',
        email: creds.email,
        name: creds.name,
        role: creds.role,
        token: `sim_token_${demoKey.toLowerCase()}`,
        access_token: `sim_token_${demoKey.toLowerCase()}`
      };
      sessionStorage.setItem('nex_token', demoUser.token!);
      sessionStorage.setItem('nex_user', JSON.stringify(demoUser));
      onLoginSuccess(demoUser);
      onClose();
    } catch (_err: any) {
      // Offline fallback on network error or 404
      const demoUser: User = {
        user_id: demoKey === 'CUSTOMER' ? 'usr_101' : demoKey === 'WAREHOUSE_MANAGER' ? 'usr_102' : 'usr_100',
        email: creds.email,
        name: creds.name,
        role: creds.role,
        token: `sim_token_${demoKey.toLowerCase()}`,
        access_token: `sim_token_${demoKey.toLowerCase()}`
      };
      sessionStorage.setItem('nex_token', demoUser.token!);
      sessionStorage.setItem('nex_user', JSON.stringify(demoUser));
      onLoginSuccess(demoUser);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-[#d5d9d9] dark:border-slate-800 rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4 text-[#0f1111] dark:text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 text-xl font-black">
            <span>Nex</span>
            <span className="text-[#febd69]">Commerce</span>
            <span className="text-xs font-normal text-gray-500 ml-1">Portal</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black dark:hover:text-white text-lg p-1"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-gray-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 text-center font-bold transition border-b-2 ${
              !isRegister ? 'border-[#e47911] text-[#0f1111] dark:text-white' : 'border-transparent text-gray-400'
            }`}
          >
            Sign in
          </button>
          <button
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 text-center font-bold transition border-b-2 ${
              isRegister ? 'border-[#e47911] text-[#0f1111] dark:text-white' : 'border-transparent text-gray-400'
            }`}
          >
            Create account
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded border border-rose-300 flex items-center gap-2">
            <i className="fa-solid fa-circle-exclamation"></i>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {isRegister && (
            <div>
              <label className="block font-bold mb-1">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First and last name"
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                required
              />
            </div>
          )}

          <div>
            <label className="block font-bold mb-1">Email or Phone Number</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. abhinay@klh.edu.in"
              className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
              required
            />
          </div>

          {isRegister && (
            <div>
              <label className="block font-bold mb-1">System Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
              >
                <option value="CUSTOMER">Customer / Shopper</option>
                <option value="WAREHOUSE_MANAGER">Warehouse Manager</option>
                <option value="ADMIN">System Administrator</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="a-button a-button-primary w-full py-2 text-xs font-bold shadow"
          >
            {isLoading ? 'Authenticating...' : isRegister ? 'Create your NexCommerce Account' : 'Sign In'}
          </button>
        </form>

        {/* 1-Click Demo Logins for Presentations */}
        <div className="pt-3 border-t border-gray-200 dark:border-slate-800 space-y-2">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
            1-Click Presentation Access:
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('CUSTOMER')}
              className="a-button a-button-subtle text-[11px] py-1.5 px-1 font-bold truncate dark:bg-slate-800 dark:border-slate-700"
              title="Customer Login"
            >
              <i className="fa-solid fa-user text-sky-500"></i> Customer
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('WAREHOUSE_MANAGER')}
              className="a-button a-button-subtle text-[11px] py-1.5 px-1 font-bold truncate dark:bg-slate-800 dark:border-slate-700"
              title="Manager Login"
            >
              <i className="fa-solid fa-boxes-stacked text-amber-500"></i> Manager
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('ADMIN')}
              className="a-button a-button-subtle text-[11px] py-1.5 px-1 font-bold truncate dark:bg-slate-800 dark:border-slate-700"
              title="Admin Login"
            >
              <i className="fa-solid fa-shield-halved text-emerald-500"></i> Admin
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
