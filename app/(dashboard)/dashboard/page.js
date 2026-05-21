'use client';
import { useEffect, useState } from 'react';

function fmtPrice(n) { return '₸ ' + Math.round(n || 0).toLocaleString('ru-RU'); }

export default function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadStats(); }, []);

    async function loadStats() {
        setLoading(true);
        try {
            const res = await fetch('/api/kaspi?action=stats');
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setStats(data);
        } catch (e) { setError(e.message); }
        setLoading(false);
    }

    if (loading) return <div className="loader"><div className="spinner"></div> Kaspi деректері жүктелуде...</div>;
    if (error) return (
        <div>
            <div className="pg-head"><h1>Показатели</h1><p>Kaspi Магазин статистикасы</p></div>
            <div style={{background:'#fef2f2',color:'var(--red)',padding:20,borderRadius:12}}>
                <strong>Kaspi API қосылым қатесі</strong><br/>{error}<br/>
                <small>.env.local файлындағы KASPI_API_TOKEN тексеріңіз</small>
            </div>
        </div>
    );

    const maxAmt = Math.max(...(stats.dailySales || []).map(d => d.amount), 1);

    return (
        <div>
            <div className="pg-head"><h1>Показатели</h1><p>Kaspi Магазин статистикасы</p></div>

            <div className="stats">
                <div className="st">
                    <div className="st-lab"><span className="st-dot" style={{background:'var(--green)'}}></span> Бүгінгі сатылым</div>
                    <div className="st-val">{fmtPrice(stats.todaySales)}</div>
                    <div className="st-sub" style={{color:'var(--green)'}}>Бүгін {stats.todayOrders} тапсырыс</div>
                </div>
                <div className="st">
                    <div className="st-lab"><span className="st-dot" style={{background:'var(--blue)'}}></span> Жаңа тапсырыстар</div>
                    <div className="st-val">{stats.newOrders}</div>
                    <div className="st-sub">Қабылдау күтуде</div>
                </div>
                <div className="st">
                    <div className="st-lab"><span className="st-dot" style={{background:'var(--orange)'}}></span> Орташа чек</div>
                    <div className="st-val">{fmtPrice(stats.avgCheck)}</div>
                    <div className="st-sub">Kaspi Магазин</div>
                </div>
                <div className="st">
                    <div className="st-lab"><span className="st-dot" style={{background:'var(--red)'}}></span> Апталық сатылым</div>
                    <div className="st-val">{fmtPrice(stats.weekSales)}</div>
                    <div className="st-sub">{stats.weekOrders} тапсырыс (7 күн)</div>
                </div>
            </div>

            <div className="card">
                <div className="card-h"><h3>Апталық сатылым</h3></div>
                <div className="card-body">
                    <div className="chart-simple">
                        {(stats.dailySales || []).map((d, i) => (
                            <div className="chart-col" key={i}>
                                <div className="chart-val">{d.amount > 0 ? (d.amount / 1000000).toFixed(1) + 'M' : '0'}</div>
                                <div className="chart-bar" style={{ height: Math.max((d.amount / maxAmt) * 140, 2) }}></div>
                                <div className="chart-lbl">{d.day}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-h"><h3>Бүгінгі қорытынды</h3></div>
                <div className="card-body" style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:20}}>
                    <div style={{textAlign:'center'}}>
                        <div style={{fontSize:'1.4rem',fontWeight:800,color:'var(--green)'}}>{stats.completedToday}</div>
                        <div style={{fontSize:'.82rem',color:'var(--text2)'}}>Аяқталған</div>
                    </div>
                    <div style={{textAlign:'center'}}>
                        <div style={{fontSize:'1.4rem',fontWeight:800,color:'var(--blue)'}}>{stats.newOrders}</div>
                        <div style={{fontSize:'.82rem',color:'var(--text2)'}}>Жаңа</div>
                    </div>
                    <div style={{textAlign:'center'}}>
                        <div style={{fontSize:'1.4rem',fontWeight:800,color:'var(--red)'}}>{stats.cancelledToday}</div>
                        <div style={{fontSize:'.82rem',color:'var(--text2)'}}>Бас тартылған</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
