# QOIMAM — Kaspi бизнес ассистент

Kaspi Магазин тапсырыстарын басқару, аналитика және ИИ ассистент.

## Мүмкіндіктер

- Тіркелу / Кіру (JWT аутентификация)
- **Показатели** — бүгінгі сатылым, апталық статистика, графиктер
- **Заказы** — тапсырыстар тізімі, фильтрлер, статустар
- **ИИ Ассистент** — Kaspi деректері негізінде сұрақтарға жауап

## Орнату

### 1. Тәуелділіктерді орнату

```bash
cd qoimam
npm install
```

### 2. Environment айнымалыларын баптау

`.env.local.example` файлын `.env.local` деп көшіріңіз:

```bash
cp .env.local.example .env.local
```

`.env.local` файлын ашып, Kaspi API токенін қойыңыз:

```
KASPI_API_TOKEN=сіздің_kaspi_api_токеніңіз
JWT_SECRET=кездейсоқ-құпия-кілт-мұнда
```

**Kaspi API токенін алу:**
1. [Kaspi Кабинет продавца](https://kaspi.kz/mc) — кіріңіз
2. Настройки → API → Сформировать токен
3. Токенді көшіріп `.env.local` файлына қойыңыз

### 3. Локалды іске қосу

```bash
npm run dev
```

Браузерде ашыңыз: [http://localhost:3000](http://localhost:3000)

## Vercel-ге деплой

### Вариант 1: Vercel CLI

```bash
npm i -g vercel
cd qoimam
vercel
```

Сұрақтарға жауап беріңіз, содан кейін Environment Variables бетінде қосыңыз:
- `KASPI_API_TOKEN` — Kaspi API токені
- `JWT_SECRET` — кез келген құпия кілт (ұзын, кездейсоқ)

### Вариант 2: GitHub арқылы

1. Жобаны GitHub-қа push жасаңыз
2. [vercel.com](https://vercel.com) — GitHub репозиторийін қосыңыз
3. Environment Variables бетінде `KASPI_API_TOKEN` және `JWT_SECRET` қосыңыз
4. Deploy басыңыз

## Маңызды ескертулер

- Қазіргі нұсқада пайдаланушылар жадта (in-memory) сақталады — сервер қайта іске қосылғанда тіркелу деректері жойылады
- Продакшн үшін Vercel Postgres немесе басқа дерекқор қосу ұсынылады
- Kaspi API токенін ешқашан ашық кодта сақтамаңыз

## Технологиялар

- Next.js 14 (App Router)
- React 18
- Kaspi Merchant API
- JWT аутентификация
- CSS (минималист дизайн)
