import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const SECRET = process.env.JWT_SECRET || 'qoimam-default-secret-change-me';

// Жадыда сақтау (Vercel Postgres немесе KV-ге ауыстыруға болады)
// Production-да деректер базасын қосу керек
let users = [];

export function hashPassword(password) {
    return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password, hash) {
    return bcrypt.compareSync(password, hash);
}

export function createToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        SECRET,
        { expiresIn: '7d' }
    );
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, SECRET);
    } catch {
        return null;
    }
}

export function getUsers() { return users; }
export function addUser(user) { users.push(user); return user; }
export function findUser(email) { return users.find(u => u.email === email); }

export function getCurrentUser() {
    const cookieStore = cookies();
    const token = cookieStore.get('qoimam_token')?.value;
    if (!token) return null;
    return verifyToken(token);
}
