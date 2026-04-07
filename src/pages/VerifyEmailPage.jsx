import { useEffect, useState } from 'react';
import { BookOpen, CheckCircle, XCircle, Loader, ArrowRight } from 'lucide-react';

/**
 * VerifyEmailPage
 * Shown when user clicks the verification link from their email.
 * URL pattern: http://localhost:5173/?token=<uuid>
 */
export default function VerifyEmailPage({ onGoLogin }) {
    const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
    const [message, setMessage] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (!token) {
            setStatus('error');
            setMessage('No verification token found. Please check your email link.');
            return;
        }

        // Call Spring Boot backend to verify
        fetch(`/api/auth/verify-email?token=${token}`)
            .then(async (res) => {
                const data = await res.json().catch(() => ({}));
                if (res.ok) {
                    setStatus('success');
                    setMessage(data.message || 'Email verified successfully!');
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Verification failed. The link may have expired.');
                }
            })
            .catch(() => {
                setStatus('error');
                setMessage('Could not connect to the server. Please try again later.');
            });
    }, []);

    const iconStyle = (color, bg) => ({
        width: 80, height: 80, margin: '0 auto 28px',
        background: bg, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.4s ease',
    });

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px', position: 'relative', overflow: 'hidden',
        }}>
            {/* Ambient orbs */}
            <div style={{
                position: 'absolute', width: 500, height: 500, borderRadius: '50%',
                background: status === 'success' ? 'rgba(16,185,129,0.08)'
                    : status === 'error' ? 'rgba(239,68,68,0.08)'
                        : 'rgba(108,99,255,0.08)',
                top: -150, left: -150, transition: 'background 0.5s',
            }} />
            <div style={{
                position: 'absolute', width: 350, height: 350,
                background: 'rgba(6,182,212,0.06)', borderRadius: '50%', bottom: -80, right: -80,
            }} />

            {/* Card */}
            <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderRadius: 20, padding: '52px 48px',
                maxWidth: 460, width: '100%', textAlign: 'center',
                boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
            }}>
                {/* Brand */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 40 }}>
                    <div className="sidebar-logo-icon animate-glow">
                        <BookOpen size={20} color="#fff" />
                    </div>
                    <div style={{ fontFamily: 'Outfit', fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
                        Course Cloud
                    </div>
                </div>

                {/* Status icon */}
                {status === 'loading' && (
                    <div style={iconStyle('#6c63ff', 'rgba(108,99,255,0.12)')}>
                        <Loader size={36} color="#6c63ff" style={{ animation: 'spin 1s linear infinite' }} />
                    </div>
                )}
                {status === 'success' && (
                    <div style={iconStyle('#34d399', 'rgba(16,185,129,0.12)')}>
                        <CheckCircle size={40} color="#34d399" />
                    </div>
                )}
                {status === 'error' && (
                    <div style={iconStyle('#f87171', 'rgba(239,68,68,0.12)')}>
                        <XCircle size={40} color="#f87171" />
                    </div>
                )}

                {/* Title */}
                <h1 style={{
                    fontSize: 22, fontWeight: 800, marginBottom: 12,
                    color: status === 'success' ? '#34d399' : status === 'error' ? '#f87171' : 'var(--text-primary)',
                }}>
                    {status === 'loading' && 'Verifying your email…'}
                    {status === 'success' && '✅ Email Verified!'}
                    {status === 'error' && '❌ Verification Failed'}
                </h1>

                {/* Message */}
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, marginBottom: 36 }}>
                    {status === 'loading'
                        ? 'Please wait while we verify your email address…'
                        : message}
                </p>

                {/* Buttons */}
                {status !== 'loading' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <button
                            onClick={onGoLogin}
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%', justifyContent: 'center', gap: 8 }}
                        >
                            {status === 'success' ? 'Sign In to Dashboard' : 'Back to Sign In'}
                            <ArrowRight size={16} />
                        </button>
                        {status === 'error' && (
                            <button
                                onClick={() => window.location.href = '/'}
                                className="btn btn-secondary"
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                Go to Home
                            </button>
                        )}
                    </div>
                )}

                {/* Success note */}
                {status === 'success' && (
                    <p style={{
                        marginTop: 24, fontSize: 12, color: 'var(--text-muted)',
                        background: 'rgba(52,211,153,0.08)', padding: '10px 16px',
                        borderRadius: 8, border: '1px solid rgba(52,211,153,0.2)',
                    }}>
                        🎉 A welcome email has been sent to your inbox!
                    </p>
                )}
            </div>
        </div>
    );
}
