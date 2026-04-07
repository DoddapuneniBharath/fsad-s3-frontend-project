import { useState, useEffect } from 'react';
import { useApp, ROLES } from '../context/AppContext';
import { authApi } from '../api';
import {
    BookOpen, Eye, EyeOff, UserPlus, User, Shield,
    AlertCircle, CheckCircle, ArrowLeft, Check, Star, Palette, Mail, RefreshCw,
} from 'lucide-react';

// ── Role cards config ─────────────────────────────────────────────────────────
const ROLE_INFO = [
    { role: ROLES.ADMIN,           label: 'Admin',           icon: <Shield size={20} />,  desc: 'Manage platform, users & settings',          color: '#f87171', bg: 'rgba(239,68,68,0.15)' },
    { role: ROLES.INSTRUCTOR,      label: 'Instructor',      icon: <Star size={20} />,    desc: 'Create courses, assignments & grade students', color: '#a78bfa', bg: 'rgba(108,99,255,0.15)' },
    { role: ROLES.STUDENT,         label: 'Student',         icon: <User size={20} />,    desc: 'Enroll in courses, submit assignments',         color: '#34d399', bg: 'rgba(16,185,129,0.15)' },
    { role: ROLES.CONTENT_CREATOR, label: 'Content Creator', icon: <Palette size={20} />, desc: 'Create educational materials & content',        color: '#fbbf24', bg: 'rgba(245,158,11,0.15)' },
];

// ── Password strength indicator ───────────────────────────────────────────────
function PasswordStrength({ password }) {
    const checks = [
        { label: 'At least 8 characters',    ok: password.length >= 8 },
        { label: 'Uppercase letter (A–Z)',    ok: /[A-Z]/.test(password) },
        { label: 'Lowercase letter (a–z)',    ok: /[a-z]/.test(password) },
        { label: 'Number (0–9)',              ok: /\d/.test(password) },
        { label: 'Special character (!@#…)', ok: /[^a-zA-Z0-9]/.test(password) },
    ];
    const passed = checks.filter(c => c.ok).length;
    const strength = passed <= 1 ? 'Weak' : passed <= 3 ? 'Fair' : passed === 4 ? 'Good' : 'Strong';
    const sc = passed <= 1 ? '#f87171' : passed <= 3 ? '#fbbf24' : passed === 4 ? '#60a5fa' : '#34d399';
    if (!password) return null;
    return (
        <div style={{ marginTop: 10, padding: '12px 14px', background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                    {[1,2,3,4,5].map(i => (
                        <div key={i} style={{ width: 32, height: 4, borderRadius: 2, background: i <= passed ? sc : 'var(--bg-elevated)', transition: 'background 0.3s' }} />
                    ))}
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: sc }}>{strength}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                {checks.map(c => (
                    <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                        <Check size={11} style={{ color: c.ok ? '#34d399' : 'var(--text-muted)', flexShrink: 0 }} />
                        <span style={{ color: c.ok ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{c.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Main SignupPage ───────────────────────────────────────────────────────────
export default function SignupPage({ onSignup, onGoLogin }) {
    const { register } = useApp();

    const [step, setStep]               = useState(1);      // 1=Role 2=Details 3=OTP
    const [selectedRole, setRole]       = useState('');
    const [form, setForm]               = useState({ name: '', email: '', password: '', confirm: '' });
    const [otp, setOtp]                 = useState('');
    const [showPass, setShowPass]       = useState(false);
    const [showConf, setShowConf]       = useState(false);
    const [loading, setLoading]         = useState(false);
    const [error, setError]             = useState('');
    const [success, setSuccess]         = useState(false);
    const [timer, setTimer]             = useState(600);    // 10 min countdown
    const [resendCooldown, setResendCooldown] = useState(0);

    const setField = f => e => { setForm(p => ({ ...p, [f]: e.target.value })); setError(''); };

    // ── Countdown timer when on Step 3 ────────────────────────────────────────
    useEffect(() => {
        if (step !== 3) return;
        setTimer(600);
        const id = setInterval(() => setTimer(t => (t <= 1 ? (clearInterval(id), 0) : t - 1)), 1000);
        return () => clearInterval(id);
    }, [step]);

    // ── Resend cooldown ───────────────────────────────────────────────────────
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const id = setInterval(() => setResendCooldown(c => c - 1), 1000);
        return () => clearInterval(id);
    }, [resendCooldown]);

    const fmtTime = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    // ── Validation ────────────────────────────────────────────────────────────
    const validate = () => {
        if (!form.name.trim() || form.name.trim().length < 2) return 'Please enter your full name (at least 2 characters).';
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email address.';
        if (!form.password || form.password.length < 8) return 'Password must be at least 8 characters.';
        if (!/[A-Z]/.test(form.password)) return 'Password must contain at least one uppercase letter.';
        if (!/\d/.test(form.password)) return 'Password must contain at least one number.';
        if (form.password !== form.confirm) return 'Passwords do not match.';
        return null;
    };

    // ── Step 2 submit: register → sends OTP → go to step 3 ────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        const err = validate();
        if (err) { setError(err); return; }
        setLoading(true);
        const result = await register({ name: form.name, email: form.email, password: form.password, role: selectedRole });
        setLoading(false);
        if (result.error) { setError(result.error); return; }
        setStep(3);
    };

    // ── Step 3: verify OTP ────────────────────────────────────────────────────
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const code = otp.replace(/\s/g, '');
        if (code.length !== 6 || !/^\d{6}$/.test(code)) { setError('Please enter the 6-digit code from your email.'); return; }
        setLoading(true);
        try {
            const data = await authApi.verifyOtp(form.email, code);
            if (data.token) localStorage.setItem('coursecloud_token', data.token);
            setLoading(false);
            setSuccess(true);
            setTimeout(() => onSignup(), 2000);
        } catch (err) {
            setLoading(false);
            setError(err.message || 'Invalid OTP. Please check your email and try again.');
        }
    };

    // ── Resend OTP ────────────────────────────────────────────────────────────
    const handleResend = async () => {
        if (resendCooldown > 0) return;
        setOtp('');
        setError('');
        setResendCooldown(30);
        try {
            await authApi.resendOtp(form.email);
            setTimer(600);
        } catch (err) {
            setError(err.message);
        }
    };

    // ── Shared UI helpers ─────────────────────────────────────────────────────
    const stepLabels = ['Choose Role', 'Your Details', 'Verify Email'];

    const StepBar = () => (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginBottom:24 }}>
            {stepLabels.map((label, i) => {
                const n = i + 1, done = step > n, active = step === n;
                return (
                    <div key={n} style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <div style={{ width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background: done ? '#34d399' : active ? 'var(--primary)' : 'var(--bg-elevated)', color:'#fff', fontSize:12, fontWeight:700, boxShadow: active ? '0 0 12px rgba(108,99,255,0.5)' : 'none', transition:'all 0.3s' }}>
                            {done ? <Check size={13}/> : n}
                        </div>
                        <span style={{ fontSize:12, color: active ? 'var(--text-primary)' : done ? '#34d399' : 'var(--text-muted)', fontWeight: active ? 700 : 400 }}>{label}</span>
                        {n < 3 && <div style={{ width:28, height:1, background: done ? '#34d399' : 'var(--border-light)', transition:'background 0.3s' }} />}
                    </div>
                );
            })}
        </div>
    );

    const ErrorBanner = () => !error ? null : (
        <div style={{ display:'flex', alignItems:'flex-start', gap:10, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:10, padding:'11px 14px', marginBottom:18 }}>
            <AlertCircle size={15} style={{ color:'#f87171', flexShrink:0, marginTop:1 }} />
            <span style={{ fontSize:13, color:'#f87171', lineHeight:1.5 }}>{error}</span>
        </div>
    );

    // ── Success screen ─────────────────────────────────────────────────────────
    if (success) return (
        <div className="login-page">
            <div className="login-bg-orb" style={{ width:400, height:400, background:'rgba(16,185,129,0.1)', top:-100, left:-100 }} />
            <div className="login-card" style={{ maxWidth:400, textAlign:'center' }}>
                <div style={{ width:80, height:80, background:'rgba(16,185,129,0.15)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
                    <CheckCircle size={40} style={{ color:'#34d399' }} />
                </div>
                <h2 style={{ fontSize:22, fontWeight:700, marginBottom:8 }}>🎉 Email Verified!</h2>
                <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:6 }}>Welcome, <strong style={{ color:'var(--text-primary)' }}>{form.name}</strong>!</p>
                <p style={{ color:'var(--text-muted)', fontSize:13 }}>Redirecting to your dashboard…</p>
                <div style={{ marginTop:20 }}>
                    <span style={{ width:20, height:20, border:'2px solid rgba(52,211,153,0.4)', borderTopColor:'#34d399', borderRadius:'50%', animation:'spin 0.8s linear infinite', display:'inline-block' }} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="login-page">
            <div className="login-bg-orb" style={{ width:500, height:500, background:'rgba(108,99,255,0.1)', top:-150, left:-150 }} />
            <div className="login-bg-orb" style={{ width:300, height:300, background:'rgba(6,182,212,0.07)', bottom:-80, right:-80 }} />

            <div className="login-card" style={{ maxWidth: step === 1 ? 520 : 460 }}>

                {/* Brand */}
                <div style={{ display:'flex', alignItems:'center', gap:12, justifyContent:'center', marginBottom:24 }}>
                    <div className="sidebar-logo-icon animate-glow"><BookOpen size={20} color="#fff" /></div>
                    <div>
                        <div style={{ fontFamily:'Outfit', fontSize:22, fontWeight:800, color:'var(--text-primary)', lineHeight:1 }}>Course Cloud</div>
                        <div style={{ fontSize:10, color:'var(--text-muted)', letterSpacing:'1.2px', textTransform:'uppercase', marginTop:2 }}>Learning Platform</div>
                    </div>
                </div>

                <StepBar />

                {/* ══════════════ STEP 1 — Choose Role ══════════════ */}
                {step === 1 && (
                    <div>
                        <div style={{ textAlign:'center', marginBottom:24 }}>
                            <h1 style={{ fontSize:20, fontWeight:700, marginBottom:6 }}>Join as…</h1>
                            <p style={{ color:'var(--text-secondary)', fontSize:14 }}>Pick the role that best describes you</p>
                        </div>

                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:28 }}>
                            {ROLE_INFO.map(({ role, label, icon, desc, color, bg }) => (
                                <button key={role} onClick={() => { setRole(role); setError(''); }}
                                    style={{ padding:'18px 14px', borderRadius:14, cursor:'pointer', textAlign:'left', border: selectedRole===role ? `2px solid ${color}` : '2px solid var(--border-light)', background: selectedRole===role ? bg : 'var(--bg-surface)', transition:'all 0.2s', display:'flex', flexDirection:'column', gap:8, transform: selectedRole===role ? 'translateY(-2px)' : 'none', boxShadow: selectedRole===role ? `0 6px 24px ${color}25` : 'none', position:'relative' }}>
                                    <div style={{ width:38, height:38, borderRadius:10, background: selectedRole===role ? `${color}25` : 'var(--bg-elevated)', display:'flex', alignItems:'center', justifyContent:'center', color: selectedRole===role ? color : 'var(--text-muted)' }}>{icon}</div>
                                    <div>
                                        <div style={{ fontSize:13, fontWeight:700, color: selectedRole===role ? 'var(--text-primary)' : 'var(--text-secondary)', marginBottom:3 }}>{label}</div>
                                        <div style={{ fontSize:11, color:'var(--text-muted)', lineHeight:1.5 }}>{desc}</div>
                                    </div>
                                    {selectedRole===role && <div style={{ position:'absolute', top:10, right:10 }}><Check size={14} style={{ color }} /></div>}
                                </button>
                            ))}
                        </div>

                        <button onClick={() => selectedRole ? (setStep(2), setError('')) : setError('Please select a role to continue.')}
                            className="btn btn-primary btn-lg" style={{ width:'100%', justifyContent:'center' }} disabled={!selectedRole}>
                            Continue →
                        </button>
                        {error && <div style={{ color:'#f87171', fontSize:13, textAlign:'center', marginTop:10 }}>{error}</div>}
                    </div>
                )}

                {/* ══════════════ STEP 2 — Account Details ══════════════ */}
                {step === 2 && (
                    <div>
                        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                            <button onClick={() => { setStep(1); setError(''); }} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-light)', borderRadius:8, padding:'6px 10px', cursor:'pointer', color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:4, fontSize:13, fontFamily:'inherit' }}>
                                <ArrowLeft size={14} /> Back
                            </button>
                            <div>
                                <div style={{ fontSize:17, fontWeight:700 }}>Create Your Account</div>
                                <div style={{ fontSize:12, color:'var(--text-muted)' }}>Signing up as <strong style={{ color:'var(--primary-light)' }}>{ROLE_INFO.find(r=>r.role===selectedRole)?.label}</strong></div>
                            </div>
                        </div>

                        <ErrorBanner />

                        <form onSubmit={handleSubmit} noValidate>
                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input id="signup-name" className="form-input" placeholder="e.g. Jane Smith" value={form.name} onChange={setField('name')} autoComplete="name" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address *</label>
                                <input id="signup-email" className="form-input" type="email" placeholder="jane@example.com" value={form.email} onChange={setField('email')} autoComplete="email" />
                            </div>
                            <div className="form-group" style={{ position:'relative' }}>
                                <label className="form-label">Password *</label>
                                <input id="signup-password" className="form-input" type={showPass?'text':'password'} placeholder="Create a strong password" value={form.password} onChange={setField('password')} style={{ paddingRight:44 }} autoComplete="new-password" />
                                <button type="button" onClick={() => setShowPass(s=>!s)} style={{ position:'absolute', right:12, top:38, color:'var(--text-muted)', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center' }}>
                                    {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                                </button>
                                <PasswordStrength password={form.password} />
                            </div>
                            <div className="form-group" style={{ position:'relative' }}>
                                <label className="form-label">Confirm Password *</label>
                                <input id="signup-confirm" className="form-input" type={showConf?'text':'password'} placeholder="Re-enter your password" value={form.confirm} onChange={setField('confirm')} style={{ paddingRight:44 }} autoComplete="new-password" />
                                <button type="button" onClick={() => setShowConf(s=>!s)} style={{ position:'absolute', right:12, top:38, color:'var(--text-muted)', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center' }}>
                                    {showConf ? <EyeOff size={16}/> : <Eye size={16}/>}
                                </button>
                                {form.confirm && form.password !== form.confirm && <div style={{ fontSize:12, color:'#f87171', marginTop:6, display:'flex', alignItems:'center', gap:4 }}><AlertCircle size={12}/> Passwords do not match</div>}
                                {form.confirm && form.password === form.confirm && form.confirm.length > 0 && <div style={{ fontSize:12, color:'#34d399', marginTop:6, display:'flex', alignItems:'center', gap:4 }}><CheckCircle size={12}/> Passwords match</div>}
                            </div>
                            <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:18, lineHeight:1.6 }}>
                                By creating an account you agree to our <a href="#" onClick={e=>e.preventDefault()} style={{ color:'var(--primary-light)', textDecoration:'none' }}>Terms of Service</a>.
                            </div>
                            <button id="signup-submit" type="submit" className="btn btn-primary btn-lg" style={{ width:'100%', justifyContent:'center' }} disabled={loading}>
                                {loading
                                    ? <span style={{ display:'flex', alignItems:'center', gap:8 }}><span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite', display:'inline-block' }} /> Sending OTP…</span>
                                    : <span style={{ display:'flex', alignItems:'center', gap:8 }}><Mail size={16}/> Send Verification OTP</span>
                                }
                            </button>
                        </form>
                    </div>
                )}

                {/* ══════════════ STEP 3 — Enter OTP ══════════════ */}
                {step === 3 && (
                    <div>
                        {/* Header */}
                        <div style={{ textAlign:'center', marginBottom:28 }}>
                            <div style={{ width:72, height:72, background:'rgba(108,99,255,0.12)', border:'2px solid rgba(108,99,255,0.3)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                                <Mail size={32} color="#a78bfa" />
                            </div>
                            <h1 style={{ fontSize:20, fontWeight:700, marginBottom:8 }}>Check your inbox!</h1>
                            <p style={{ color:'var(--text-secondary)', fontSize:13, lineHeight:1.7 }}>
                                We sent a <strong style={{ color:'var(--text-primary)' }}>6-digit OTP</strong> to<br/>
                                <strong style={{ color:'var(--primary-light)' }}>{form.email}</strong>
                            </p>
                        </div>

                        <ErrorBanner />

                        <form onSubmit={handleVerifyOtp}>
                            {/* ── BIG OTP INPUT BOX ── */}
                            <div className="form-group">
                                <label className="form-label" style={{ textAlign:'center', display:'block', fontSize:13, letterSpacing:'0.5px' }}>
                                    Enter the 6-digit code from your email
                                </label>
                                <input
                                    id="otp-input"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    placeholder="_ _ _ _ _ _"
                                    value={otp}
                                    onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                                    autoFocus
                                    autoComplete="one-time-code"
                                    style={{
                                        width: '100%',
                                        textAlign: 'center',
                                        fontSize: 36,
                                        fontWeight: 900,
                                        letterSpacing: 14,
                                        fontFamily: 'monospace',
                                        padding: '18px 12px',
                                        background: otp.length === 6 ? 'rgba(108,99,255,0.1)' : 'var(--bg-surface)',
                                        border: otp.length === 6 ? '2px solid rgba(108,99,255,0.6)' : '2px solid var(--border-light)',
                                        borderRadius: 14,
                                        color: 'var(--text-primary)',
                                        boxShadow: otp.length === 6 ? '0 0 20px rgba(108,99,255,0.2)' : 'none',
                                        transition: 'all 0.2s',
                                        boxSizing: 'border-box',
                                    }}
                                />
                                {/* Progress dots */}
                                <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:12 }}>
                                    {[0,1,2,3,4,5].map(i => (
                                        <div key={i} style={{ width:10, height:10, borderRadius:'50%', background: i < otp.length ? '#6c63ff' : 'var(--bg-elevated)', transition:'background 0.15s', boxShadow: i < otp.length ? '0 0 8px rgba(108,99,255,0.5)' : 'none' }} />
                                    ))}
                                </div>
                            </div>

                            {/* Timer */}
                            <div style={{ textAlign:'center', marginBottom:20, marginTop:4 }}>
                                {timer > 0
                                    ? <span style={{ fontSize:13, color: timer < 60 ? '#f87171' : 'var(--text-muted)' }}>
                                        ⏰ Code expires in{' '}
                                        <strong style={{ color: timer < 60 ? '#f87171' : 'var(--primary-light)' }}>{fmtTime(timer)}</strong>
                                      </span>
                                    : <span style={{ fontSize:13, color:'#f87171' }}>⚠️ OTP expired. Please resend.</span>
                                }
                            </div>

                            {/* Verify Button */}
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                style={{ width:'100%', justifyContent:'center', fontSize:16 }}
                                disabled={loading || otp.length !== 6}
                            >
                                {loading
                                    ? <span style={{ display:'flex', alignItems:'center', gap:8 }}><span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite', display:'inline-block' }} /> Verifying…</span>
                                    : <span style={{ display:'flex', alignItems:'center', gap:8 }}><CheckCircle size={18}/> Verify &amp; Create Account</span>
                                }
                            </button>
                        </form>

                        {/* Resend */}
                        <div style={{ textAlign:'center', marginTop:20 }}>
                            <span style={{ fontSize:13, color:'var(--text-muted)' }}>Didn't receive the code? </span>
                            <button onClick={handleResend} disabled={resendCooldown > 0}
                                style={{ background:'none', border:'none', fontSize:13, fontWeight:700, color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--primary-light)', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', display:'inline-flex', alignItems:'center', gap:4, fontFamily:'inherit' }}>
                                <RefreshCw size={13}/>
                                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                            </button>
                        </div>

                        {/* Change email */}
                        <button onClick={() => { setStep(2); setError(''); setOtp(''); }}
                            style={{ background:'none', border:'none', color:'var(--text-muted)', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:4, margin:'14px auto 0', fontFamily:'inherit' }}>
                            <ArrowLeft size={12}/> Change email address
                        </button>
                    </div>
                )}

                {/* Bottom sign-in link (steps 1 & 2 only) */}
                {step !== 3 && (
                    <>
                        <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0 0' }}>
                            <div style={{ flex:1, height:1, background:'var(--border-light)' }} />
                            <span style={{ fontSize:12, color:'var(--text-muted)', whiteSpace:'nowrap' }}>Already have an account?</span>
                            <div style={{ flex:1, height:1, background:'var(--border-light)' }} />
                        </div>
                        <button onClick={onGoLogin} className="btn btn-secondary btn-lg" style={{ width:'100%', justifyContent:'center', marginTop:12, fontWeight:600 }}>
                            Sign In Instead
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
