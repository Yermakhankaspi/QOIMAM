'use client';
import { useState, useRef, useEffect } from 'react';

const quickActions = [
    { label: 'Бүгінгі тапсырыстар', prompt: 'Бүгінгі тапсырыстар туралы ақпарат бер' },
    { label: 'Жаңа тапсырыстар', prompt: 'Жаңа тапсырыстар бар ма?' },
    { label: 'Сатылым статистикасы', prompt: 'Бүгінгі сатылым статистикасын көрсет' },
    { label: 'Бас тартылғандар', prompt: 'Бас тартылған тапсырыстар туралы айтып бер' },
];

function fmtPrice(n) { return '₸ ' + Math.round(n || 0).toLocaleString('ru-RU'); }

export default function AIPage() {
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Сәлеметсіз бе! Мен QOIMAM ИИ ассистентімін. Kaspi Магазин тапсырыстары, статистика және басқа сұрақтар бойынша көмектесе аламын. Сұрағыңызды жазыңыз!' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const chatRef = useRef(null);

    useEffect(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [messages]);

    async function sendMessage(text) {
        if (!text.trim() || loading) return;
        const userMsg = text.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            // Fetch real Kaspi data
            const [statsRes, ordersRes] = await Promise.all([
                fetch('/api/kaspi?action=stats'),
                fetch('/api/kaspi?action=orders&size=20')
            ]);
            const stats = await statsRes.json();
            const ordersData = await ordersRes.json();
            const orders = ordersData.orders || [];

            const answer = generateAnswer(userMsg, stats, orders);
            setMessages(prev => [...prev, { role: 'ai', text: answer }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'ai', text: 'Қате орын алды: ' + e.message }]);
        }
        setLoading(false);
    }

    function generateAnswer(question, stats, orders) {
        const q = question.toLowerCase();

        // Today's orders
        if (q.includes('бүгін') && (q.includes('тапсырыс') || q.includes('заказ'))) {
            const newCount = orders.filter(o => o.status === 'APPROVED_BY_BANK').length;
            const acceptedCount = orders.filter(o => o.status === 'ACCEPTED_BY_MERCHANT').length;
            const completedCount = orders.filter(o => o.status === 'COMPLETED').length;
            return `Бүгінгі тапсырыстар:\n\n` +
                `• Жаңа (қабылдау күтуде): ${stats.newOrders || newCount}\n` +
                `• Қабылданған: ${acceptedCount}\n` +
                `• Аяқталған: ${stats.completedToday || completedCount}\n` +
                `• Бас тартылған: ${stats.cancelledToday || 0}\n\n` +
                `Бүгінгі жалпы сатылым: ${fmtPrice(stats.todaySales)}`;
        }

        // New orders
        if (q.includes('жаңа') && (q.includes('тапсырыс') || q.includes('заказ'))) {
            const newOrders = orders.filter(o => o.status === 'APPROVED_BY_BANK');
            if (newOrders.length === 0) return 'Қазір жаңа тапсырыстар жоқ.';
            let text = `${newOrders.length} жаңа тапсырыс бар:\n\n`;
            newOrders.slice(0, 5).forEach((o, i) => {
                text += `${i + 1}. №${o.code} — ${o.customer?.name || 'Клиент'} — ${fmtPrice(o.totalPrice)}\n`;
            });
            if (newOrders.length > 5) text += `\n...және тағы ${newOrders.length - 5} тапсырыс`;
            return text;
        }

        // Sales statistics
        if (q.includes('сатылым') || q.includes('статистика') || q.includes('продаж')) {
            return `Сатылым статистикасы:\n\n` +
                `• Бүгінгі сатылым: ${fmtPrice(stats.todaySales)}\n` +
                `• Бүгінгі тапсырыстар: ${stats.todayOrders || 0}\n` +
                `• Апталық сатылым: ${fmtPrice(stats.weekSales)}\n` +
                `• Апталық тапсырыстар: ${stats.weekOrders || 0}\n` +
                `• Орташа чек: ${fmtPrice(stats.avgCheck)}`;
        }

        // Cancelled / returned
        if (q.includes('бас тарт') || q.includes('қайтар') || q.includes('отмен') || q.includes('возврат')) {
            const cancelled = orders.filter(o => o.status === 'CANCELLED' || o.status === 'RETURNED' || o.status === 'KASPI_DELIVERY_RETURN_REQUESTED');
            if (cancelled.length === 0) return 'Бас тартылған немесе қайтарылған тапсырыстар табылмады.';
            let text = `${cancelled.length} бас тартылған/қайтарылған тапсырыс:\n\n`;
            cancelled.slice(0, 5).forEach((o, i) => {
                const st = o.status === 'CANCELLED' ? 'Бас тартылды' : o.status === 'RETURNED' ? 'Қайтарылды' : 'Қайтару сұралды';
                text += `${i + 1}. №${o.code} — ${fmtPrice(o.totalPrice)} — ${st}\n`;
            });
            return text;
        }

        // Delivery
        if (q.includes('жеткіз') || q.includes('доставк')) {
            const delivery = orders.filter(o => o.deliveryMode && o.deliveryMode !== 'PICKUP');
            if (delivery.length === 0) return 'Жеткізу тапсырыстары табылмады.';
            let text = `${delivery.length} жеткізу тапсырысы:\n\n`;
            delivery.slice(0, 5).forEach((o, i) => {
                text += `${i + 1}. №${o.code} — ${o.customer?.name || ''} — ${o.deliveryMode?.replace(/_/g, ' ')}\n`;
            });
            return text;
        }

        // Average check
        if (q.includes('орташа') || q.includes('средн')) {
            return `Орташа чек: ${fmtPrice(stats.avgCheck)}\n\nБүгін ${stats.todayOrders || 0} тапсырыс, жалпы сомасы ${fmtPrice(stats.todaySales)}.`;
        }

        // General help
        return `Мен келесі сұрақтарға жауап бере аламын:\n\n` +
            `• Бүгінгі тапсырыстар\n` +
            `• Жаңа тапсырыстар\n` +
            `• Сатылым статистикасы\n` +
            `• Бас тартылған тапсырыстар\n` +
            `• Жеткізу тапсырыстары\n` +
            `• Орташа чек\n\n` +
            `Сұрағыңызды қазақша немесе орысша жазыңыз!`;
    }

    return (
        <div>
            <div className="pg-head"><h1>ИИ Ассистент</h1><p>Kaspi деректері негізінде сұрақтарыңызға жауап береді</p></div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)', minHeight: 400 }}>
                <div className="card-h"><h3>Чат</h3></div>

                <div ref={chatRef} className="chat-area" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {messages.map((m, i) => (
                        <div key={i} className={`chat-msg ${m.role}`}>
                            <div className={`chat-bubble ${m.role}`}>
                                {m.text.split('\n').map((line, j) => (
                                    <span key={j}>{line}<br /></span>
                                ))}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="chat-msg ai">
                            <div className="chat-bubble ai" style={{ opacity: 0.7 }}>
                                <span className="typing-dots">Жауап дайындалуда</span>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                        {quickActions.map((a, i) => (
                            <button key={i} className="badge" style={{ cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg)', fontSize: '.78rem', padding: '5px 10px' }}
                                onClick={() => sendMessage(a.prompt)}>
                                {a.label}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input
                            className="chat-input"
                            style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', fontSize: '.9rem', background: 'var(--bg)' }}
                            placeholder="Сұрағыңызды жазыңыз..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                        />
                        <button className="auth-btn" style={{ padding: '10px 20px', borderRadius: 10, fontSize: '.9rem' }}
                            onClick={() => sendMessage(input)} disabled={loading || !input.trim()}>
                            Жіберу
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
