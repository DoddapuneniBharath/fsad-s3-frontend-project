import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import Dashboard from './pages/Dashboard';
import CoursesPage from './pages/CoursesPage';
import UsersPage from './pages/UsersPage';
import AssignmentsPage from './pages/AssignmentsPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import SettingsPage from './pages/SettingsPage';
import ContentPage from './pages/ContentPage';
import './index.css';

// ── Email not-verified banner ─────────────────────────────────────────────────
function EmailVerificationBanner({ email }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const resend = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch { /* ignore */ }
    setLoading(false);
  };

  return (
    <div style={{
      background: 'linear-gradient(90deg,rgba(245,158,11,0.15),rgba(245,158,11,0.08))',
      border: '1px solid rgba(245,158,11,0.35)',
      borderRadius: 10, padding: '12px 20px', marginBottom: 20,
      display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: 18 }}>⚠️</span>
      <span style={{ flex: 1, color: '#fbbf24', fontSize: 13, fontWeight: 500 }}>
        Your email <strong>{email}</strong> is not verified.
        Please check your inbox and click the verification link.
      </span>
      {sent ? (
        <span style={{ color: '#34d399', fontSize: 13, fontWeight: 600 }}>✅ Email resent!</span>
      ) : (
        <button onClick={resend} disabled={loading} style={{
          background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)',
          color: '#fbbf24', borderRadius: 8, padding: '6px 16px',
          fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          {loading ? 'Sending…' : 'Resend Email'}
        </button>
      )}
    </div>
  );
}

// ── Dashboard Layout ──────────────────────────────────────────────────────────
function DashboardLayout({ children }) {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) return <Navigate to="/login" />;

  return (
    <div className="app-layout">
      <Sidebar onLogout={handleLogout} />
      <main className="main-content">
        <TopHeader />
        <div className="page-content">
          {currentUser && currentUser.emailVerified === false && (
            <EmailVerificationBanner email={currentUser.email} />
          )}
          {children}
        </div>
      </main>
    </div>
  );
}

// ── Main shell ────────────────────────────────────────────────────────────────
function AppShell() {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  // ── Email verification route: detects ?token= in URL ─────────────────────
  const urlParams = new URLSearchParams(window.location.search);
  const verifyToken = urlParams.get('token');
  if (verifyToken) {
    return (
      <VerifyEmailPage
        onGoLogin={() => {
          window.history.replaceState({}, '', '/login');
          navigate('/login');
        }}
      />
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!currentUser ? <LoginPage onLogin={() => navigate('/dashboard')} onGoSignup={() => navigate('/signup')} /> : <Navigate to="/dashboard" />} />
      <Route path="/signup" element={!currentUser ? <SignupPage onSignup={() => navigate('/login')} onGoLogin={() => navigate('/login')} /> : <Navigate to="/dashboard" />} />
      
      {/* Protected Routes */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
      <Route path="/courses" element={<DashboardLayout><CoursesPage view="browse" /></DashboardLayout>} />
      <Route path="/my-courses" element={<DashboardLayout><CoursesPage view="my-learning" /></DashboardLayout>} />
      <Route path="/users" element={<DashboardLayout><UsersPage /></DashboardLayout>} />
      <Route path="/assignments" element={<DashboardLayout><AssignmentsPage /></DashboardLayout>} />
      <Route path="/announcements" element={<DashboardLayout><AnnouncementsPage /></DashboardLayout>} />
      <Route path="/settings" element={<DashboardLayout><SettingsPage /></DashboardLayout>} />
      <Route path="/content" element={<DashboardLayout><ContentPage /></DashboardLayout>} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
