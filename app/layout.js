import './globals.css';

export const metadata = {
    title: 'QOIMAM — Kaspi бизнес ассистент',
    description: 'Kaspi Магазин тапсырыстарын басқару, аналитика, ИИ ассистент',
};

export default function RootLayout({ children }) {
    return (
        <html lang="kk">
            <body>{children}</body>
        </html>
    );
}
