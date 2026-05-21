'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const navItems = [
    { href: '/dashboard', label: 'Показатели', icon: <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
    { href: '/dashboard/orders', label: 'Заказы', icon: <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> },
    { href: '/dashboard/ai', label: 'ИИ Ассистент', icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg> },
];

export default function DashboardLayout({ children }) {
    const [user, setUser] = useState(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const stored = localStorage.getItem('qoimam_user');
        if (!stored) { router.push('/'); return; }
        setUser(JSON.parse(stored));
    }, [router]);

    async function logout() {
        await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'logout' })
        });
        localStorage.removeItem('qoimam_user');
        router.push('/');
    }

    if (!user) return <div className="loader"><div className="spinner"></div></div>;

    return (
        <div className="app-layout">
            <aside className="side">
                <div className="side-logo">QOIMAM</div>
                <div style={{display:'flex',flexDirection:'column',gap:2,flex:1}}>
                    {navItems.map(item => (
                        <a key={item.href} href={item.href}
                           className={`nav-btn ${pathname === item.href ? 'on' : ''}`}
                           onClick={e => { e.preventDefault(); router.push(item.href); }}>
                            {item.icon}
                            {item.label}
                        </a>
                    ))}
                </div>
                <div className="side-bot">
                    <div className="side-user">
                        <div className="side-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                        <div>
                            <div style={{fontWeight:600,fontSize:'.85rem'}}>{user.name}</div>
                            <div style={{fontSize:'.72rem',color:'var(--text3)'}}>{user.email}</div>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={logout}>Шығу</button>
                </div>
            </aside>
            <div className="content">{children}</div>
        </div>
    );
}
