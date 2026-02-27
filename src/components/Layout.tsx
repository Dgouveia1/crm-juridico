import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Users, Bell, LogOut,
  Columns, ChevronRight, Sparkles, Scale, Search, X, Menu
} from 'lucide-react';
import { useAppContext } from '../store/AppContext';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { alerts, processes } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const urgentAlerts = alerts.filter(a => !a.dismissed && a.daysUntil <= 7).length;

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', desc: 'Centro de Comando' },
    { path: '/processos', icon: FileText, label: 'Processos', desc: 'Gestão Processual' },
    { path: '/kanban', icon: Columns, label: 'Funil / Kanban', desc: 'Visão por Etapa' },
    { path: '/crm', icon: Users, label: 'CRM (Partes)', desc: 'Clientes & Partes' },
    { path: '/alertas', icon: Bell, label: 'Alertas', desc: 'Prazos & Intimações', badge: urgentAlerts },
  ];

  const isActive = (path: string) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  const currentPage = navItems.find(i => isActive(i.path));

  return (
    <div className="app-shell">
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Brand header */}
        <div className="sidebar-brand" style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logos/logo.png" alt="World Games" style={{ width: '130px', height: 'auto', objectFit: 'contain' }} />

          {/* Copiloto badge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: 'auto', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', color: '#f59e0b', fontSize: '11px', fontWeight: 900, letterSpacing: '0.5px' }}>
              <span>COPILOTO IA</span>
            </div>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, fontFamily: 'monospace', letterSpacing: '1px' }}>V2.0</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <p className="sidebar-nav-label">MENU PRINCIPAL</p>
          {navItems.map(({ path, icon: Icon, label, desc, badge }) => {
            const active = isActive(path);
            return (
              <Link
                key={path}
                to={path}
                className={`sidebar-nav-item ${active ? 'sidebar-nav-item--active' : ''}`}
              >
                <div className="sidebar-nav-item-left">
                  <div className={`sidebar-nav-icon ${active ? 'sidebar-nav-icon--active' : ''}`}>
                    <Icon size={18} />
                  </div>
                  <div className="sidebar-nav-label-wrap">
                    <span className="sidebar-nav-label-main">{label}</span>
                    {sidebarOpen && <span className="sidebar-nav-label-desc">{desc}</span>}
                  </div>
                </div>
                <div className="sidebar-nav-item-right">
                  {badge !== undefined && badge > 0 && (
                    <span className="sidebar-badge">{badge}</span>
                  )}
                  {active && <ChevronRight size={14} className="sidebar-chevron" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Stats strip */}
        <div className="sidebar-stats">
          <div className="sidebar-stat">
            <span className="sidebar-stat-val">{processes.length}</span>
            <span className="sidebar-stat-label">Processos</span>
          </div>
          <div className="sidebar-stat-divider" />
          <div className="sidebar-stat">
            <span className="sidebar-stat-val sidebar-stat-val--alert">{urgentAlerts}</span>
            <span className="sidebar-stat-label">Alertas</span>
          </div>
        </div>

        {/* User + logout */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">LM</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">Luiz Mamprin</span>
              <span className="sidebar-user-role">Advogado Principal</span>
            </div>
          </div>
          <button onClick={handleLogout} className="sidebar-logout" title="Sair">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────────── */}
      <main className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-breadcrumb">
              <span className="topbar-breadcrumb-home">Copiloto</span>
              <ChevronRight size={14} />
              <span className="topbar-breadcrumb-current">{currentPage?.label || 'Detalhes'}</span>
            </div>
          </div>
          <div className="topbar-right">
            <div className="topbar-search">
              <Search size={15} className="topbar-search-icon" />
              <input placeholder="Busca rápida..." className="topbar-search-input" readOnly
                onClick={() => navigate('/processos')} />
            </div>
            <Link to="/alertas" className="topbar-bell">
              <Bell size={18} />
              {urgentAlerts > 0 && <span className="topbar-bell-badge">{urgentAlerts}</span>}
            </Link>
            <div className="topbar-avatar">LM</div>
          </div>
        </header>

        {/* Page content */}
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
