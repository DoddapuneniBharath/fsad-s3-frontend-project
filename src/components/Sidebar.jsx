// src/components/Sidebar.jsx
import { useApp, ROLES } from '../context/AppContext';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    BookOpen, LayoutDashboard, Users, BookMarked, FileText,
    Megaphone, Settings, LogOut, ChevronRight,
    GraduationCap, Star, Palette, Shield, Package,
} from 'lucide-react';

const NAV_CONFIG = {
    [ROLES.ADMIN]: [
        {
            label: 'Overview', items: [
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'users', label: 'User Management', icon: Users },
                { id: 'courses', label: 'All Courses', icon: BookMarked },
                { id: 'announcements', label: 'Announcements', icon: Megaphone },
            ],
        },
        {
            label: 'System', items: [
                { id: 'settings', label: 'Platform Settings', icon: Settings },
            ],
        },
    ],
    [ROLES.INSTRUCTOR]: [
        {
            label: 'Teaching', items: [
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'courses', label: 'My Courses', icon: BookMarked },
                { id: 'assignments', label: 'Assignments', icon: FileText },
                { id: 'announcements', label: 'Announcements', icon: Megaphone },
            ],
        },
        {
            label: 'Account', items: [
                { id: 'settings', label: 'Settings', icon: Settings },
            ],
        },
    ],
    [ROLES.STUDENT]: [
        {
            label: 'Learning', items: [
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'courses', label: 'Browse Courses', icon: BookMarked },
                { id: 'my-courses', label: 'My Learning', icon: GraduationCap },
                { id: 'assignments', label: 'Assignments', icon: FileText },
                { id: 'content', label: 'Study Materials', icon: Package },
            ],
        },
        {
            label: 'Community', items: [
                { id: 'announcements', label: 'Announcements', icon: Megaphone },
            ],
        },
    ],
    [ROLES.CONTENT_CREATOR]: [
        {
            label: 'Content', items: [
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'content', label: 'Content Library', icon: Package },
                { id: 'courses', label: 'Browse Courses', icon: BookMarked },
                { id: 'announcements', label: 'Announcements', icon: Megaphone },
            ],
        },
        {
            label: 'Account', items: [
                { id: 'settings', label: 'Settings', icon: Settings },
            ],
        },
    ],
};

const ROLE_BADGE_COLORS = {
    [ROLES.ADMIN]: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
    [ROLES.INSTRUCTOR]: { bg: 'rgba(108,99,255,0.15)', color: '#a78bfa' },
    [ROLES.STUDENT]: { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
    [ROLES.CONTENT_CREATOR]: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
};

const ROLE_ICONS = {
    [ROLES.ADMIN]: <Shield size={10} />,
    [ROLES.INSTRUCTOR]: <Star size={10} />,
    [ROLES.STUDENT]: <GraduationCap size={10} />,
    [ROLES.CONTENT_CREATOR]: <Palette size={10} />,
};

export default function Sidebar({ onLogout }) {
    const { currentUser } = useApp();
    const navigate = useNavigate();
    const navSections = NAV_CONFIG[currentUser?.role] || NAV_CONFIG[ROLES.STUDENT];
    const roleColor = ROLE_BADGE_COLORS[currentUser?.role] || ROLE_BADGE_COLORS[ROLES.STUDENT];
    const roleIcon = ROLE_ICONS[currentUser?.role];

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">
                    <BookOpen size={20} color="#fff" />
                </div>
                <div>
                    <div className="sidebar-logo-text">Course Cloud</div>
                    <div className="sidebar-logo-sub">Learning Platform</div>
                </div>
            </div>

            {/* Role Badge */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '5px 12px', borderRadius: 20,
                    background: roleColor.bg, color: roleColor.color,
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
                }}>
                    {roleIcon}
                    {currentUser?.role}
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {navSections.map(section => (
                    <div key={section.label}>
                        <div className="sidebar-section-label">{section.label}</div>
                        {section.items.map(({ id, label, icon: Icon, badge }) => (
                            <NavLink
                                key={id}
                                to={`/${id}`}
                                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <Icon size={16} />
                                {label}
                                {badge && <span className="nav-badge">{badge}</span>}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>


            {/* Footer */}
            <div className="sidebar-footer">
                <div className="sidebar-user" onClick={() => navigate('/settings')} style={{ cursor: 'pointer' }}>
                    <div className="avatar-placeholder" style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: '#fff', fontSize: 13 }}>
                        {currentUser?.initials}
                    </div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{currentUser?.name}</div>
                        <div className="sidebar-user-role">{currentUser?.email}</div>
                    </div>
                    <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
                <button
                    onClick={onLogout}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 12px', borderRadius: 8, marginTop: 4,
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', fontSize: 13, fontWeight: 500,
                        fontFamily: 'Inter', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                    <LogOut size={15} /> Sign Out
                </button>
            </div>
        </aside>
    );
}
