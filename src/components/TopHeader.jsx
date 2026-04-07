import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Bell, Check } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function TopHeader() {
    const { currentUser, notifications, setNotifications } = useApp();
    const location = useLocation();
    const activePage = location.pathname.split('/')[1] || 'dashboard';
    const [showNotifs, setShowNotifs] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const notifRef = useRef(null);

    const unread = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    const pageLabels = {
        dashboard: 'Dashboard', users: 'User Management', courses: 'Courses',
        'my-courses': 'My Learning', assignments: 'Assignments', students: 'Students',
        content: 'Content Library', announcements: 'Announcements', settings: 'Settings',
    };

    return (
        <header className="top-header">
            <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {pageLabels[activePage] || 'Dashboard'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
                    Welcome back, {currentUser.name.split(' ')[0]} 👋
                </div>
            </div>

            {/* Search */}
            <div className="search-bar" style={{ marginLeft: 'auto' }}>
                <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                    placeholder="Search courses, users..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="header-actions">
                {/* Notifications */}
                <div className="dropdown" ref={notifRef}>
                    <button className="notification-btn" onClick={() => setShowNotifs(!showNotifs)}>
                        <Bell size={18} />
                        {unread > 0 && <span className="notification-dot" />}
                    </button>
                    {showNotifs && (
                        <div className="dropdown-menu" style={{ width: 300 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px 12px', borderBottom: '1px solid var(--border-light)' }}>
                                <span style={{ fontSize: 13, fontWeight: 600 }}>Notifications</span>
                                {unread > 0 && (
                                    <button onClick={markAllRead} style={{ fontSize: 11, color: 'var(--primary-light)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            {notifications.map(n => (
                                <div key={n.id} className="dropdown-item" style={{ alignItems: 'flex-start', gap: 10 }}
                                    onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.read ? 'var(--text-muted)' : 'var(--primary)', marginTop: 4, flexShrink: 0 }} />
                                    <div>
                                        <div style={{ fontSize: 13, color: n.read ? 'var(--text-muted)' : 'var(--text-primary)', fontWeight: n.read ? 400 : 500 }}>{n.text}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{n.time}</div>
                                    </div>
                                    {n.read && <Check size={12} style={{ color: 'var(--success)', marginLeft: 'auto' }} />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* User avatar — display only, no dropdown */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                    borderRadius: 10, padding: '6px 12px',
                    color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500,
                }}>
                    <div style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700, color: '#fff',
                    }}>
                        {currentUser.initials}
                    </div>
                    <span style={{ color: 'var(--text-primary)' }}>{currentUser.name.split(' ')[0]}</span>
                </div>
            </div>
        </header>
    );
}
