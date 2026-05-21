import { NextResponse } from 'next/server';
import { getOrders, getStats, getOrderEntries, checkConnection } from '@/lib/kaspi';

// GET /api/kaspi?action=orders|stats|entries|status
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'orders';

    try {
        if (action === 'status') {
            const result = await checkConnection();
            return NextResponse.json(result);
        }

        if (action === 'stats') {
            const stats = await getStats();
            return NextResponse.json(stats);
        }

        if (action === 'entries') {
            const orderId = searchParams.get('orderId');
            if (!orderId) return NextResponse.json({ error: 'orderId керек' }, { status: 400 });
            const entries = await getOrderEntries(orderId);
            return NextResponse.json(entries);
        }

        // Default: orders
        const state = searchParams.get('state') || '';
        const status = searchParams.get('status') || '';
        const page = parseInt(searchParams.get('page') || '0');
        const size = parseInt(searchParams.get('size') || '20');

        const result = await getOrders({ state, status, page, size });
        return NextResponse.json(result);

    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
