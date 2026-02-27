import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Scale, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    if (username === 'lmamprin' && password === 'lalala123') {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/');
      toast.success('Acesso autorizado!');
    } else {
      toast.error('Credenciais inválidas.');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      {/* Left panel */}
      <div className="login-left">
        <div className="login-left-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <img src="/logos/logo.png" alt="World Games" style={{ width: '320px', height: 'auto', objectFit: 'contain' }} />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '22px', fontWeight: 900, letterSpacing: '2px' }}>
                <Sparkles size={20} />
                <span>COPILOTO IA</span>
                <Sparkles size={20} />
              </div>
              <span style={{ fontSize: '16px', color: '#cbd5e1', fontWeight: 600, fontFamily: 'monospace', letterSpacing: '3px' }}>V2.0</span>
            </div>
          </div>

          <p className="login-left-sub" style={{ marginTop: '16px', fontSize: '18px' }}>
            Gestão processual inteligente com<br />o poder da Inteligência Artificial.
          </p>
          <div className="login-left-badges">
            <span className="login-badge">⚖️ e-SAJ Integrado</span>
            <span className="login-badge">🔔 Alertas Automáticos</span>
            <span className="login-badge">📊 Analytics</span>
          </div>
        </div>
        {/* Decorative golden cloud */}
        <div className="login-orb" style={{ width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(212,160,23,0.3) 0%, rgba(212,160,23,0) 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.8, filter: 'blur(60px)' }} />
        <div className="login-orb login-orb-2" />
      </div>

      {/* Right panel — form */}
      <div className="login-right">
        <div className="login-card">
          {/* Header */}
          <div className="login-card-header">
            <div className="login-card-copiloto">
              <Sparkles size={14} />
              <span>POWERED BY COPILOTO IA 2.0</span>
              <Sparkles size={14} />
            </div>
            <h2 className="login-card-title">Login</h2>
            <p className="login-card-sub">Acesso exclusivo para advogados cadastrados.</p>
          </div>

          {/* Form */}
          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-field">
              <label htmlFor="username" className="login-label">Usuário</label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="login-input"
                placeholder="Seu usuário"
                autoComplete="username"
              />
            </div>

            <div className="login-field">
              <label htmlFor="password" className="login-label">Senha</label>
              <div className="login-input-wrap">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="login-input login-input--pass"
                  placeholder="Sua senha"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-eye"
                  onClick={() => setShowPass(s => !s)}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`login-btn ${loading ? 'login-btn--loading' : ''}`}
            >
              {loading ? (
                <span className="login-spinner" />
              ) : (
                'Acessar Sistema'
              )}
            </button>
          </form>

          <p className="login-footer-text">
            Sistema protegido • Dr Luiz Mamprin © 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
