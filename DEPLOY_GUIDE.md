# QOIMAM — Деплой нұсқаулығы (GitHub + Vercel)

## 1-қадам: Қажетті бағдарламалар

Егер орнатылмаған болса:
- Node.js: https://nodejs.org (LTS нұсқасы)
- Git: https://git-scm.com

## 2-қадам: .gitignore файлын тексеру

`qoimam` папкасында `.gitignore` файлы болуы керек. Егер жоқ болса, жасаңыз:

```
node_modules
.next
.env.local
.env*.local
.DS_Store
```

Бұл файл `.env.local` (токеніңіз бар файл) GitHub-қа түспеуін қамтамасыз етеді.

## 3-қадам: Kaspi API токенін баптау

`.env.local.example` файлын `.env.local` деп көшіріңіз:

```bash
cp .env.local.example .env.local
```

`.env.local` файлын ашып, мәндерді жазыңыз:

```
KASPI_API_TOKEN=сіздің_нақты_kaspi_токеніңіз
JWT_SECRET=кездейсоқ_ұзын_құпия_сөз_мұнда
```

Kaspi API токенін алу жолы:
1. https://kaspi.kz/mc — кіріңіз
2. Настройки → API → Сформировать токен
3. Токенді көшіріңіз

## 4-қадам: Локалды тексеру

Терминалды ашып:

```bash
cd /путь/к/qoimam
npm install
npm run dev
```

Браузерде http://localhost:3000 ашып, жұмыс істейтінін тексеріңіз.
Тексергеннен кейін терминалда Ctrl+C басып тоқтатыңыз.

## 5-қадам: GitHub-қа жүктеу

### 5.1. GitHub-та жаңа репозиторий жасау

1. https://github.com/new ашыңыз
2. Repository name: `qoimam`
3. **Private** таңдаңыз (Kaspi деректері үшін маңызды!)
4. "Create repository" басыңыз
5. Ашылған беттегі HTTPS сілтемені көшіріңіз (мысалы: https://github.com/username/qoimam.git)

### 5.2. Терминалда жобаны push жасау

```bash
cd /путь/к/qoimam
git init
git add .
git commit -m "QOIMAM - Kaspi бизнес ассистент"
git branch -M main
git remote add origin https://github.com/СІЗДІҢ_USERNAME/qoimam.git
git push -u origin main
```

Егер GitHub логин сұраса — username мен токеніңізді енгізіңіз.

## 6-қадам: Vercel-ге деплой

### 6.1. Vercel аккаунт

1. https://vercel.com ашыңыз
2. "Sign Up" → "Continue with GitHub" басыңыз
3. GitHub аккаунтыңызбен кіріңіз

### 6.2. Жобаны қосу

1. "Add New..." → "Project" басыңыз
2. "Import Git Repository" бөлімінде `qoimam` репозиторийін табыңыз
3. "Import" басыңыз

### 6.3. Environment Variables баптау

Deploy бетінде "Environment Variables" бөлімін ашып, екі айнымалы қосыңыз:

| Name             | Value                           |
|------------------|---------------------------------|
| KASPI_API_TOKEN  | сіздің Kaspi API токеніңіз      |
| JWT_SECRET       | кез келген ұзын құпия сөз       |

### 6.4. Deploy

"Deploy" батырмасын басыңыз. 1-2 минут күтіңіз.

Дайын болғанда Vercel сізге сілтеме береді:
`https://qoimam-xxxxx.vercel.app`

Бұл сіздің дайын сайтыңыз!

## Бұдан кейін

Кодты жаңартқан кезде:

```bash
git add .
git commit -m "Жаңарту сипаттамасы"
git push
```

Vercel **автоматты түрде** қайта деплой жасайды — қосымша ештеңе істеудің қажеті жоқ.

## Мәселелер туындаса

- **"Module not found"** қатесі → `npm install` қайта жүргізіңіз
- **Kaspi деректері көрінбейді** → `.env.local` ішіндегі `KASPI_API_TOKEN` дұрыстығын тексеріңіз
- **Vercel-де қате** → Vercel dashboard → Settings → Environment Variables тексеріңіз
- **Кіру мүмкін емес** → Алдымен тіркеліңіз (Тіркелу табы), содан кейін кіріңіз
