import { NextResponse } from 'next/server';
import { hashPassword, verifyPassword, createToken, findUser, addUser } from '@/lib/auth';

// POST /api/auth — login немесе register
export async function POST(req) {
    const body = await req.json();
    const { action, email, password, name, phone } = body;

    if (action === 'register') {
        if (!email || !password || !name) {
            return NextResponse.json({ error: 'Барлық өрістерді толтырыңыз' }, { status: 400 });
        }
        if (findUser(email)) {
            return NextResponse.json({ error: 'Бұл email тіркелген' }, { status: 400 });
        }
        const user = {
            id: Date.now().toString(),
            name, email, phone: phone || '',
            passwordHash: hashPassword(password),
            created: new Date().toISOString()
        };
        addUser(user);
        const token = createToken(user);

        const response = NextResponse.json({ success: true, user: { name: user.name, email: user.email } });
        response.cookies.set('qoimam_token', token, {
            httpOnly: true, secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/'
        });
        return response;
    }

    if (action === 'login') {
        if (!email || !password) {
            return NextResponse.json({ error: 'Email мен құпия сөзді енгізіңіз' }, { status: 400 });
        }
        const user = findUser(email);
        if (!user || !verifyPassword(password, user.passwordHash)) {
            return NextResponse.json({ error: 'Email немесе құпия сөз қате' }, { status: 401 });
        }
        const token = createToken(user);

        const response = NextResponse.json({ success: true, user: { name: user.name, email: user.email } });
        response.cookies.set('qoimam_token', token, {
            httpOnly: true, secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/'
        });
        return response;
    }

    if (action === 'logout') {
        const response = NextResponse.json({ success: true });
        response.cookies.delete('qoimam_token');
        return response;
    }

    return NextResponse.json({ error: 'Белгісіз action' }, { status: 400 });
}
