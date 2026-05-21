'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
    const [tab, setTab] = useState('login');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        const form = new FormData(e.target);

        const body = {
            action: tab,
            email: form.get('email'),
            password: form.get('password'),
            ...(tab === 'register' && {
                name: form.get('name'),
                phone: form.get('phone'),
            })
        };

        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (data.error) { setError(data.error); setLoading(false); return; }
            if (data.success) {
                localStorage.setItem('qoimam_user', JSON.stringify(data.user));
                router.push('/dashboard');
            }
        } catch {
            setError('Қосылым қатесі');
        }
        setLoading(false);
    }

    return (
        <div className="auth-wrap">
            <div className="auth-box">
                <div className="auth-logo">
                    <h1>QOIMAM</h1>
                    <p>Kaspi бизнесіңізді басқарыңыз</p>
                </div>
                <div className="auth-card">
                    <div className="auth-tabs">
                        <button className={`auth-tab ${tab==='login'?'on':''}`} onClick={()=>{setTab('login');setError('')}}>Кіру</button>
                        <button className={`auth-tab ${tab==='register'?'on':''}`} onClick={()=>{setTab('register');setError('')}}>Тіркелу</button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {tab === 'register' && (
                            <>
                                <div className="field">
                                    <label>Атыңыз</label>
                                    <input name="name" placeholder="Korkem" required />
                                </div>
                                <div className="field">
                                    <label>Телефон</label>
                                    <input name="phone" type="tel" placeholder="+7 7XX XXX XX XX" />
                                </div>
                            </>
                        )}
                        <div className="field">
                            <label>Email</label>
                            <input name="email" type="email" placeholder="email@example.com" required />
                        </div>
                        <div className="field">
                            <label>Құпия сөз</label>
                            <input name="password" type="password" placeholder="••••••••" required minLength={6} />
                        </div>
                        <div className="auth-err">{error}</div>
                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? 'Күтіңіз...' : tab === 'login' ? 'Кіру' : 'Тіркелу'}
                        </button>
                    </form>
                </div>
                <p style={{textAlign:'center',marginTop:24,fontSize:'.82rem',color:'var(--text3)'}}>
                    QOIMAM &copy; 2026 — Kaspi бизнес ассистент
                </p>
            </div>
        </div>
    );
}
