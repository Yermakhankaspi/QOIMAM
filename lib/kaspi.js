/**
 * Kaspi Магазин API клиенті
 * Docs: https://guide.kaspi.kz/partner/ru/shop/api/general/q3193
 *
 * Base URL: https://kaspi.kz/shop/api/v2
 * Auth: X-Auth-Token header
 * Content-Type: application/vnd.api+json
 */

const KASPI_API = 'https://kaspi.kz/shop/api/v2';

function getHeaders() {
    return {
        'Content-Type': 'application/vnd.api+json',
        'X-Auth-Token': process.env.KASPI_API_TOKEN,
    };
}

// Тапсырыстар тізімін алу
export async function getOrders({ state, status, dateFrom, dateTo, page = 0, size = 20, includeUser = true } = {}) {
    const params = new URLSearchParams();
    params.set('page[number]', page);
    params.set('page[size]', size);

    if (state) params.set('filter[orders][state]', state);
    if (status) params.set('filter[orders][status]', status);
    if (dateFrom) params.set('filter[orders][creationDate][$ge]', dateFrom);
    if (dateTo) params.set('filter[orders][creationDate][$le]', dateTo);
    if (includeUser) params.set('include[orders]', 'user');

    const res = await fetch(`${KASPI_API}/orders?${params}`, { headers: getHeaders(), next: { revalidate: 60 } });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Kaspi API қатесі (${res.status}): ${text}`);
    }

    const json = await res.json();
    return parseOrders(json);
}

// Жеке тапсырыс
export async function getOrder(orderId) {
    const res = await fetch(`${KASPI_API}/orders/${orderId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Kaspi API қатесі: ${res.status}`);
    return res.json();
}

// Тапсырыс құрамы (entries)
export async function getOrderEntries(orderId) {
    const res = await fetch(`${KASPI_API}/orders/${orderId}/entries`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Kaspi API қатесі: ${res.status}`);
    return res.json();
}

// Тапсырыс статусын өзгерту
export async function updateOrderStatus(orderId, status) {
    const body = {
        data: {
            type: 'orders',
            id: orderId,
            attributes: { status }
        }
    };
    const res = await fetch(`${KASPI_API}/orders/${orderId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`Kaspi API қатесі: ${res.status}`);
    return res.json();
}

// Жауапты парсинг
function parseOrders(json) {
    const customers = {};
    if (json.included) {
        json.included.forEach(inc => {
            if (inc.type === 'customers') {
                customers[inc.id] = {
                    name: `${inc.attributes.firstName || ''} ${inc.attributes.lastName || ''}`.trim(),
                    phone: inc.attributes.cellPhone || ''
                };
            }
        });
    }

    const orders = (json.data || []).map(order => {
        const a = order.attributes;
        const customerId = order.relationships?.user?.data?.id;
        const customer = customers[customerId] || {
            name: a.customer ? `${a.customer.firstName || ''} ${a.customer.lastName || ''}`.trim() : 'Белгісіз',
            phone: a.customer?.cellPhone || ''
        };

        return {
            id: order.id,
            code: a.code,
            totalPrice: a.totalPrice,
            customer,
            deliveryMode: a.deliveryMode,
            paymentMode: a.paymentMode,
            state: a.state,
            status: a.status,
            creationDate: a.creationDate,
            deliveryCost: a.deliveryCost || 0,
            signatureRequired: a.signatureRequired,
            creditTerm: a.creditTerm,
            isExpress: a.express || false,
            entriesLink: order.relationships?.entries?.links?.related
        };
    });

    return {
        orders,
        meta: json.meta || { pageCount: 1, totalCount: orders.length }
    };
}

// Показатели есептеу
export async function getStats() {
    const now = Date.now();
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7); weekStart.setHours(0,0,0,0);

    const [todayData, weekData, newOrders] = await Promise.all([
        getOrders({ dateFrom: todayStart.getTime(), dateTo: now, size: 100 }),
        getOrders({ dateFrom: weekStart.getTime(), dateTo: now, size: 100 }),
        getOrders({ state: 'NEW', status: 'APPROVED_BY_BANK', size: 100 }),
    ]);

    const todaySales = todayData.orders
        .filter(o => o.status !== 'CANCELLED' && o.status !== 'RETURNED')
        .reduce((s, o) => s + o.totalPrice, 0);

    const weekSales = weekData.orders
        .filter(o => o.status !== 'CANCELLED' && o.status !== 'RETURNED')
        .reduce((s, o) => s + o.totalPrice, 0);

    const completedToday = todayData.orders.filter(o => o.status === 'COMPLETED').length;
    const cancelledToday = todayData.orders.filter(o => o.status === 'CANCELLED' || o.status === 'RETURNED').length;
    const avgCheck = todayData.orders.length > 0 ? todaySales / Math.max(todayData.orders.filter(o => o.status !== 'CANCELLED').length, 1) : 0;

    // Апталық сатылым күндер бойынша
    const dailySales = {};
    const days = ['Жк','Дс','Сс','Ср','Бс','Жм','Сб'];
    weekData.orders.forEach(o => {
        if (o.status === 'CANCELLED' || o.status === 'RETURNED') return;
        const d = new Date(o.creationDate);
        const key = days[d.getDay()];
        dailySales[key] = (dailySales[key] || 0) + o.totalPrice;
    });

    return {
        todaySales,
        weekSales,
        todayOrders: todayData.orders.length,
        weekOrders: weekData.orders.length,
        newOrders: newOrders.orders.length,
        completedToday,
        cancelledToday,
        avgCheck: Math.round(avgCheck),
        dailySales: ['Дс','Сс','Ср','Бс','Жм','Сб','Жк'].map(d => ({
            day: d,
            amount: dailySales[d] || 0
        })),
    };
}

// API қосылымын тексеру
export async function checkConnection() {
    try {
        const res = await fetch(`${KASPI_API}/orders?page[number]=0&page[size]=1`, {
            headers: getHeaders()
        });
        return { connected: res.ok, status: res.status };
    } catch (e) {
        return { connected: false, error: e.message };
    }
}
