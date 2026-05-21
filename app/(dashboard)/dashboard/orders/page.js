'use client';
import { useEffect, useState } from 'react';

function fmtPrice(n) { return '₸ ' + Math.round(n || 0).toLocaleString('ru-RU'); }
function fmtDate(ms) {
    if (!ms) return '—';
    const d = new Date(ms);
    return d.toLocaleDateString('ru-RU') + ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

const statusMap = {
    APPROVED_BY_BANK: { label: 'Жаңа', style: { background: '#dbeafe', color: '#1d4ed8' } },
    ACCEPTED_BY_MERCHANT: { label: 'Қабылданды', style: { background: '#fef3c7', color: '#92400e' } },
    COMPLETED: { label: 'Аяқталды', style: { background: '#d1fae5', color: '#065f46' } },
    CANCELLED: { label: 'Бас тартылды', style: { background: '#fee2e2', color: '#991b1b' } },
    CANCELLING: { label: 'Бас тарту...', style: { background: '#fee2e2', color: '#991b1b' } },
    RETURNED: { label: 'Қайтарылды', style: { background: '#fce7f3', color: '#9d174d' } },
    KASPI_DELIVERY_RETURN_REQUESTED: { label: 'Қайтару сұралды', style: { background: '#fce7f3', color: '#9d174d' } },
};

const stateFilters = [
    { value: '', label: 'Барлығы' },
    { value: 'NEW', label: 'Жаңа' },
    { value: 'DELIVERY', label: 'Жеткізу' },
    { value: 'KASPI_DELIVERY', label: 'Kaspi Жеткізу' },
    { value: 'PICKUP', label: 'Самовывоз' },
    { value: 'ARCHIVE', label: 'Архив' },
];

const paymentLabels = {
    PAY_WITH_CREDIT: 'Kaspi Рассрочка',
    PREPAID: 'Kaspi Red/Gold',
};

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('');

    useEffect(() => { loadOrders(); }, [filter]);

    async function loadOrders() {
        setLoading(true);
        try {
            const params = new URLSearchParams({ action: 'orders', size: '50' });
            if (filter) params.set('state', filter);
            const res = await fetch(`/api/kaspi?${params}`);
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setOrders(data.orders || []);
            setMeta(data.meta || {});
        } catch (e) { setError(e.message); }
        setLoading(false);
    }

    const counts = {
        new: orders.filter(o => o.status === 'APPROVED_BY_BANK').length,
        active: orders.filter(o => o.status === 'ACCEPTED_BY_MERCHANT').length,
        done: orders.filter(o => o.status === 'COMPLETED').length,
        cancelled: orders.filter(o => o.status === 'CANCELLED' || o.status === 'RETURNED').length,
    };

    return (
        <div>
            <div className="pg-head"><h1>Заказы</h1><p>Kaspi Магазин тапсырыстары</p></div>

            <div className="stats" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
                <div className="st"><div className="st-lab">Жаңа</div><div className="st-val" style={{color:'var(--blue)'}}>{counts.new}</div></div>
                <div className="st"><div className="st-lab">Қабылданған</div><div className="st-val" style={{color:'var(--orange)'}}>{counts.active}</div></div>
                <div className="st"><div className="st-lab">Аяқталған</div><div className="st-val" style={{color:'var(--green)'}}>{counts.done}</div></div>
                <div className="st"><div className="st-lab">Бас тартылған</div><div className="st-val" style={{color:'var(--red)'}}>{counts.cancelled}</div></div>
            </div>

            <div className="card">
                <div className="card-h">
                    <h3>Тапсырыстар ({meta.totalCount || orders.length})</h3>
                    <div style={{display:'flex',gap:4}}>
                        {stateFilters.map(f => (
                            <button key={f.value} className="badge"
                                style={{cursor:'pointer',border:'none', background: filter===f.value ? 'var(--accent)' : 'var(--bg)', color: filter===f.value ? '#fff' : 'var(--text2)'}}
                                onClick={() => setFilter(f.value)}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="loader"><div className="spinner"></div> Жүктелуде...</div>
                ) : error ? (
                    <div style={{padding:20,color:'var(--red)'}}>{error}</div>
                ) : (
                    <div style={{overflowX:'auto'}}>
                        <table>
                            <thead>
                                <tr><th>№</th><th>Клиент</th><th>Сомасы</th><th>Төлем</th><th>Жеткізу</th><th>Статус</th><th>Күні</th></tr>
                            </thead>
                            <tbody>
                                {orders.map(o => {
                                    const st = statusMap[o.status] || { label: o.status, style: { background: '#f1f5f9' } };
                                    return (
                                        <tr key={o.id}>
                                            <td style={{fontWeight:600}}>{o.code}</td>
                                            <td>
                                                <div style={{fontWeight:500}}>{o.customer.name}</div>
                                                <div style={{fontSize:'.75rem',color:'var(--text3)'}}>{o.customer.phone}</div>
                                            </td>
                                            <td style={{fontWeight:700}}>{fmtPrice(o.totalPrice)}</td>
                                            <td style={{fontSize:'.82rem',color:'var(--text2)'}}>{paymentLabels[o.paymentMode] || o.paymentMode}</td>
                                            <td style={{fontSize:'.82rem',color:'var(--text2)'}}>{o.deliveryMode?.replace(/_/g,' ') || '—'}</td>
                                            <td><span className="badge" style={st.style}>{st.label}</span></td>
                                            <td style={{fontSize:'.82rem',color:'var(--text2)'}}>{fmtDate(o.creationDate)}</td>
                                        </tr>
                                    );
                                })}
                                {orders.length === 0 && (
                                    <tr><td colSpan={7} style={{textAlign:'center',color:'var(--text3)',padding:40}}>Тапсырыстар табылмады</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
