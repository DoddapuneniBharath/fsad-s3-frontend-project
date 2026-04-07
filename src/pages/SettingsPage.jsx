import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, Bell, Shield, Palette, Globe, Database, Save, Check, Moon, Sun } from 'lucide-react';

function SettingSection({ title, icon, children }) {
    return (
        <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(108,99,255,0.15)', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
            </div>
            {children}
        </div>
    );
}

function Toggle({ value, onChange, label, desc }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
            <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</div>
                {desc && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>}
            </div>
            <button
                onClick={() => onChange(!value)}
                style={{
                    width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: value ? 'var(--primary)' : 'var(--bg-elevated)',
                    transition: 'all 0.2s', position: 'relative', flexShrink: 0,
                }}>
                <div style={{
                    width: 18, height: 18, borderRadius: 9, background: '#fff',
                    position: 'absolute', top: 3, left: value ? 23 : 3, transition: 'left 0.2s',
                }} />
            </button>
        </div>
    );
}

export default function SettingsPage() {
    const { currentUser } = useApp();
    const [saved, setSaved] = useState(false);
    const [settings, setSettings] = useState({
        platformName: 'Course Cloud',
        platformEmail: 'support@coursecloud.com',
        maxStudents: 500,
        emailNotifications: true,
        pushNotifications: true,
        weeklyReports: false,
        twoFactor: true,
        publicCourses: true,
        guestEnroll: false,
        maintenanceMode: false,
        autoGrade: true,
        certificatesEnabled: true,
    });

    const [profile, setProfile] = useState({
        name: currentUser.name,
        email: currentUser.email,
        bio: 'Passionate about education and technology.',
        timezone: 'UTC+5:30',
        language: 'English',
    });

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const isAdmin = currentUser.role === 'Admin';

    return (
        <div className="animate-fadeIn" style={{ maxWidth: 760 }}>
            <div className="page-header">
                <div>
                    <div className="page-title">Settings</div>
                    <div className="page-subtitle">Manage your account and platform preferences</div>
                </div>
                <button className="btn btn-primary" onClick={handleSave}>
                    {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save Changes</>}
                </button>
            </div>

            {/* Profile Settings */}
            <SettingSection title="Profile" icon={<Settings size={18} />}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
                    <div className="avatar-placeholder animate-glow" style={{ width: 72, height: 72, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: '#fff', fontSize: 22, fontWeight: 700, flexShrink: 0 }}>
                        {currentUser.initials}
                    </div>
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{currentUser.name}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{currentUser.role}</div>
                        <button className="btn btn-secondary btn-sm">Change Avatar</button>
                    </div>
                </div>
                <div className="grid-2">
                    <div className="form-group">
                        <label className="form-label">Display Name</label>
                        <input className="form-input" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="form-input" type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea className="form-textarea" value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} style={{ minHeight: 80 }} />
                </div>
                <div className="grid-2">
                    <div className="form-group">
                        <label className="form-label">Timezone</label>
                        <select className="form-select" value={profile.timezone} onChange={e => setProfile({ ...profile, timezone: e.target.value })}>
                            {['UTC+0:00', 'UTC+5:30', 'UTC-5:00', 'UTC-8:00', 'UTC+1:00'].map(tz => <option key={tz}>{tz}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Language</label>
                        <select className="form-select" value={profile.language} onChange={e => setProfile({ ...profile, language: e.target.value })}>
                            {['English', 'Spanish', 'French', 'German', 'Japanese'].map(l => <option key={l}>{l}</option>)}
                        </select>
                    </div>
                </div>
            </SettingSection>

            {/* Notifications */}
            <SettingSection title="Notifications" icon={<Bell size={18} />}>
                <Toggle value={settings.emailNotifications} onChange={v => setSettings({ ...settings, emailNotifications: v })} label="Email Notifications" desc="Receive updates via email" />
                <Toggle value={settings.pushNotifications} onChange={v => setSettings({ ...settings, pushNotifications: v })} label="Push Notifications" desc="Browser push notifications" />
                <Toggle value={settings.weeklyReports} onChange={v => setSettings({ ...settings, weeklyReports: v })} label="Weekly Reports" desc="Summary of your activity" />
            </SettingSection>

            {/* Security */}
            <SettingSection title="Security" icon={<Shield size={18} />}>
                <Toggle value={settings.twoFactor} onChange={v => setSettings({ ...settings, twoFactor: v })} label="Two-Factor Authentication" desc="Add an extra layer of security" />
                <div style={{ paddingTop: 16 }}>
                    <button className="btn btn-secondary">Change Password</button>
                </div>
            </SettingSection>

            {/* Platform Settings (Admin only) */}
            {isAdmin && (
                <>
                    <SettingSection title="Platform Configuration" icon={<Globe size={18} />}>
                        <div className="grid-2" style={{ marginBottom: 16 }}>
                            <div className="form-group">
                                <label className="form-label">Platform Name</label>
                                <input className="form-input" value={settings.platformName} onChange={e => setSettings({ ...settings, platformName: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Support Email</label>
                                <input className="form-input" value={settings.platformEmail} onChange={e => setSettings({ ...settings, platformEmail: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Max Students per Course</label>
                            <input className="form-input" type="number" value={settings.maxStudents} onChange={e => setSettings({ ...settings, maxStudents: e.target.value })} style={{ maxWidth: 160 }} />
                        </div>
                        <Toggle value={settings.publicCourses} onChange={v => setSettings({ ...settings, publicCourses: v })} label="Public Course Listings" desc="Allow anyone to browse courses" />
                        <Toggle value={settings.guestEnroll} onChange={v => setSettings({ ...settings, guestEnroll: v })} label="Guest Enrollment" desc="Allow trial access without account" />
                        <Toggle value={settings.maintenanceMode} onChange={v => setSettings({ ...settings, maintenanceMode: v })} label="Maintenance Mode" desc="Temporarily disable platform access" />
                    </SettingSection>

                    <SettingSection title="Learning Features" icon={<Database size={18} />}>
                        <Toggle value={settings.autoGrade} onChange={v => setSettings({ ...settings, autoGrade: v })} label="Auto-Grade Quizzes" desc="Automatically grade multiple choice" />
                        <Toggle value={settings.certificatesEnabled} onChange={v => setSettings({ ...settings, certificatesEnabled: v })} label="Certificates" desc="Enable course completion certificates" />
                    </SettingSection>
                </>
            )}
        </div>
    );
}
